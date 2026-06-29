import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';

type ScanHistoryItem = {
  id: string;
  data: string;
  type: string;
  timestamp: Date;
};

type ScanResultScreenProps = {
  navigation: any;
  route: {
    params: {
      data: string;
      type: string;
    };
  };
};

export default function ScanResultScreen({ navigation, route }: ScanResultScreenProps) {
  const { t } = useTranslation();
  const { data, type } = route.params;
  const [history, setHistory] = useState<ScanHistoryItem[]>([
    { id: '1', data, type, timestamp: new Date() },
  ]);

  const isUrl = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleOpenUrl = async (url: string) => {
    const { Linking } = require('react-native');
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  const handleNewScan = () => {
    navigation.navigate('BarcodeScanner', {
      onScanned: (scannedData: string, scannedType: string) => {
        setHistory((prev) => [
          {
            id: String(Date.now()),
            data: scannedData,
            type: scannedType,
            timestamp: new Date(),
          },
          ...prev,
        ]);
      },
    });
  };

  const renderItem = ({ item }: { item: ScanHistoryItem }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyBadge}>
        <Text style={styles.historyBadgeText}>{item.type.toUpperCase()}</Text>
      </View>
      <Text style={styles.historyData} numberOfLines={2}>
        {item.data}
      </Text>
      <Text style={styles.historyTime}>
        {item.timestamp.toLocaleTimeString()}
      </Text>
      {isUrl(item.data) && (
        <TouchableOpacity
          style={styles.openUrlButton}
          onPress={() => handleOpenUrl(item.data)}
        >
          <Text style={styles.openUrlText}>{t('scanner_open_link')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('scanner_results_title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Latest result highlight */}
      <View style={styles.latestCard}>
        <Text style={styles.latestLabel}>{t('scanner_latest_scan')}</Text>
        <View style={styles.latestTypeBadge}>
          <Text style={styles.latestTypeText}>{type.toUpperCase()}</Text>
        </View>
        <Text style={styles.latestData}>{data}</Text>
        {isUrl(data) && (
          <TouchableOpacity
            style={styles.openLinkButton}
            onPress={() => handleOpenUrl(data)}
          >
            <Text style={styles.openLinkText}>{t('scanner_open_link')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* History list */}
      {history.length > 1 && (
        <>
          <Text style={styles.historyTitle}>{t('scanner_history')}</Text>
          <FlatList
            data={history.slice(1)}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.historyList}
          />
        </>
      )}

      {/* Scan again FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleNewScan} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>📷</Text>
        <Text style={styles.fabText}>{t('scanner_scan_again')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2EDE8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D4C0A8',
  },
  backArrow: {
    fontSize: 24,
    color: '#1A1410',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1410',
  },
  headerSpacer: {
    width: 24,
  },

  // ── Latest Card ──
  latestCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
    elevation: 4,
  },
  latestLabel: {
    fontSize: 13,
    color: '#85736F',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  latestTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFCCBC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  latestTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BF360C',
  },
  latestData: {
    fontSize: 18,
    color: '#1A1410',
    fontWeight: '500',
    lineHeight: 26,
  },
  openLinkButton: {
    marginTop: 16,
    backgroundColor: '#BF360C',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  openLinkText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── History ──
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1410',
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },
  historyList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F57F17',
  },
  historyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C5800',
  },
  historyData: {
    fontSize: 15,
    color: '#1A1410',
    fontWeight: '500',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 12,
    color: '#A08878',
  },
  openUrlButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFCCBC',
  },
  openUrlText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#BF360C',
  },

  // ── FAB ──
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 36 : 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BF360C',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: '#BF360C',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    gap: 8,
  },
  fabIcon: {
    fontSize: 20,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
