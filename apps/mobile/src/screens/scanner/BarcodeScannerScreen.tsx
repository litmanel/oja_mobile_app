import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

type BarcodeScannerScreenProps = {
  navigation: any;
  route?: {
    params?: {
      /** Called with the scanned data when a barcode is detected */
      onScanned?: (data: string, type: string) => void;
      /** Optional title override */
      title?: string;
      /** Restrict to specific barcode types */
      barcodeTypes?: string[];
    };
  };
};

export default function BarcodeScannerScreen({ navigation, route }: BarcodeScannerScreenProps) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<{ data: string; type: string } | null>(null);
  const [scanLineAnim] = useState(new Animated.Value(0));

  const onScannedCallback = route?.params?.onScanned;
  const screenTitle = route?.params?.title || t('scanner_title');

  // Animate the scan line
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scanLineAnim]);

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 4],
  });

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    setScannedData({ data: result.data, type: result.type });

    if (onScannedCallback) {
      onScannedCallback(result.data, result.type);
      navigation.goBack();
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScannedData(null);
  };

  const handleCopyAndGoBack = () => {
    if (scannedData && onScannedCallback) {
      onScannedCallback(scannedData.data, scannedData.type);
    }
    navigation.goBack();
  };

  // ── Permission States ──
  if (!permission) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.loadingText}>{t('scanner_loading')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>{t('scanner_permission_title')}</Text>
          <Text style={styles.permissionText}>{t('scanner_permission_text')}</Text>
          {permission.canAskAgain ? (
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>{t('scanner_grant_permission')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }}
            >
              <Text style={styles.permissionButtonText}>{t('scanner_open_settings')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>{t('scanner_go_back')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Camera Scanner View ──
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: (route?.params?.barcodeTypes as any) || [
            'qr',
            'ean13',
            'ean8',
            'code128',
            'code39',
            'code93',
            'upc_a',
            'upc_e',
            'pdf417',
            'aztec',
            'datamatrix',
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Dark overlay with transparent scan area */}
      <View style={styles.overlay}>
        {/* Top */}
        <View style={styles.overlayTop} />

        {/* Middle row */}
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanArea}>
            {/* Corner markers */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />

            {/* Animated scan line */}
            {!scanned && (
              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanLineTranslateY }] },
                ]}
              />
            )}
          </View>
          <View style={styles.overlaySide} />
        </View>

        {/* Bottom */}
        <View style={styles.overlayBottom}>
          <Text style={styles.instructionText}>
            {scanned ? t('scanner_scanned') : t('scanner_instruction')}
          </Text>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scanned Result Card */}
      {scanned && scannedData && (
        <View style={styles.resultContainer}>
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>{t('scanner_result_label')}</Text>
            <Text style={styles.resultType}>
              {scannedData.type.toUpperCase()}
            </Text>
            <Text style={styles.resultData} numberOfLines={3}>
              {scannedData.data}
            </Text>
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.scanAgainButton} onPress={handleScanAgain}>
                <Text style={styles.scanAgainText}>{t('scanner_scan_again')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.useResultButton} onPress={handleCopyAndGoBack}>
                <Text style={styles.useResultText}>{t('scanner_use_result')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Flash / torch toggle could go here in future */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2EDE8',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#5C4A3A',
  },

  // ── Permission ──
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 6,
  },
  permissionIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1410',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: '#5C4A3A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  permissionButton: {
    backgroundColor: '#BF360C',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 28,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    marginTop: 20,
  },
  backLinkText: {
    fontSize: 15,
    color: '#85736F',
    textDecorationLine: 'underline',
  },

  // ── Overlay ──
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 32,
  },

  // ── Scan Area ──
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#F57F17',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: '#F57F17',
    borderRadius: 2,
    shadowColor: '#F57F17',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },

  // ── Instruction ──
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  // ── Header ──
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },

  // ── Result Card ──
  resultContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 20,
    elevation: 10,
  },
  resultLabel: {
    fontSize: 13,
    color: '#85736F',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  resultType: {
    fontSize: 12,
    color: '#BF360C',
    fontWeight: '700',
    marginBottom: 8,
  },
  resultData: {
    fontSize: 17,
    color: '#1A1410',
    fontWeight: '500',
    marginBottom: 20,
    lineHeight: 24,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  scanAgainButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D4C0A8',
    alignItems: 'center',
  },
  scanAgainText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5C4A3A',
  },
  useResultButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#BF360C',
    alignItems: 'center',
  },
  useResultText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
