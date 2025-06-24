import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, Settings2, Bell, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import AssetSwitcher from '../../components/AssetSwitcher';
import TimeframeSwitcher from '../../components/TimeframeSwitcher';
import ConnectionStatus from '@/components/ConnectionStatus';
import MarketOverview from '@/components/MarketOverview';
import { fetchMarketData, fetchTechnicalIndicators, fetchEconomicEvents, MarketData, TechnicalIndicator, EconomicEvent } from '../../lib/database';
import { getForexPrice } from '../../lib/forex';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const { colors, fontSizes } = useTheme();
  const [selectedAsset, setSelectedAsset] = useState<'XAU/USD' | 'XAG/USD'>('XAU/USD');
  const [timeframe, setTimeframe] = useState('1H');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator[]>([]);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  useEffect(() => {
    loadData();
    fetchLivePrice();
  }, [selectedAsset]);

  const loadData = async () => {
    try {
      const [market, indicators, events] = await Promise.all([
        fetchMarketData(),
        fetchTechnicalIndicators(selectedAsset),
        fetchEconomicEvents(),
      ]);

      setMarketData(market);
      setTechnicalIndicators(indicators);
      setEconomicEvents(events);
    } catch (error) {
      console.error('Error loading home screen data:', error);
    }
  };

  const fetchLivePrice = async () => {
    setPriceLoading(true);
    try {
      const price = await getForexPrice(selectedAsset);
      setLivePrice(price);
    } catch (error) {
      console.error('Error fetching live price:', error);
    } finally {
      setPriceLoading(false);
    }
  };

  const currentData = marketData.find(item => item.pair === selectedAsset) || {
    price: livePrice || (selectedAsset === 'XAU/USD' ? 2345.67 : 29.45),
    change: selectedAsset === 'XAU/USD' ? 12.34 : -0.23,
    change_percent: selectedAsset === 'XAU/USD' ? 0.53 : -0.77,
    high: selectedAsset === 'XAU/USD' ? 2356.89 : 29.78,
    low: selectedAsset === 'XAU/USD' ? 2334.12 : 29.12,
    volume: selectedAsset === 'XAU/USD' ? '2.4M' : '1.8M',
  };

  // Use live price if available
  if (livePrice) {
    currentData.price = livePrice;
  }

  const getTradingViewHTML = (symbol: string) => `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:${colors.surface};">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:${colors.text};font-family:Inter,sans-serif;">
          <div style="text-align:center;">
            <h3 style="margin:0 0 10px 0;">Trading Chart</h3>
            <p style="margin:0;opacity:0.7;">${symbol} Chart View</p>
            <p style="margin:10px 0 0 0;font-size:14px;opacity:0.5;">Connect to TradingView for live charts</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontSize: fontSizes.title + 4,
      fontWeight: 'bold',
      color: colors.text,
      fontFamily: 'Inter-Bold',
    },
    subtitle: {
      fontSize: fontSizes.medium,
      color: colors.textSecondary,
      fontFamily: 'Inter-Regular',
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    livePriceCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    livePriceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    pairTitle: {
      fontSize: fontSizes.subtitle,
      fontWeight: 'bold',
      color: colors.text,
      fontFamily: 'Inter-Bold',
    },
    refreshButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    changeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    livePriceValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      fontFamily: 'Inter-Bold',
      marginBottom: 12,
    },
    priceLoading: {
      color: colors.textSecondary,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    statItem: {
      alignItems: 'center',
    },
    statLabel: {
      fontSize: fontSizes.small,
      color: colors.textSecondary,
      fontFamily: 'Inter-Regular',
    },
    statValue: {
      fontSize: fontSizes.medium,
      color: colors.text,
      fontFamily: 'Inter-Medium',
    },
    chartContainer: {
      height: 300,
      marginHorizontal: 20,
      marginBottom: 24,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: fontSizes.subtitle,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      fontFamily: 'Inter-Bold',
    },
    indicatorCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    indicatorHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    indicatorName: {
      fontSize: fontSizes.medium,
      color: colors.text,
      fontFamily: 'Inter-Medium',
    },
    indicatorValue: {
      fontSize: fontSizes.medium,
      fontFamily: 'Inter-Medium',
    },
    indicatorStatus: {
      fontSize: fontSizes.small,
      fontFamily: 'Inter-Regular',
    },
    eventCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    eventTime: {
      fontSize: fontSizes.medium,
      color: colors.primary,
      fontFamily: 'Inter-Medium',
    },
    impactBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    impactText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Inter-SemiBold',
    },
    eventContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    currencyBadge: {
      fontSize: fontSizes.small,
      color: colors.primary,
      backgroundColor: `${colors.primary}20`,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: 'Inter-Medium',
    },
    eventName: {
      fontSize: fontSizes.medium,
      color: colors.text,
      flex: 1,
      fontFamily: 'Inter-Regular',
    },
    eventDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    eventDetail: {
      fontSize: fontSizes.small,
      color: colors.textSecondary,
      fontFamily: 'Inter-Regular',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Gold & Silver Signals</Text>
          <Text style={styles.subtitle}>Live Trading Opportunities</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Settings2 size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Bell size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ConnectionStatus />
      <MarketOverview />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <AssetSwitcher selectedAsset={selectedAsset} onAssetChange={setSelectedAsset} />

        {/* Live Price Card with Refresh */}
        <View style={styles.livePriceCard}>
          <View style={styles.livePriceHeader}>
            <Text style={styles.pairTitle}>{selectedAsset}</Text>
            <View style={styles.changeContainer}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={fetchLivePrice}
                disabled={priceLoading}
              >
                <RefreshCw 
                  size={16} 
                  color={colors.textSecondary}
                  style={{ opacity: priceLoading ? 0.5 : 1 }}
                />
              </TouchableOpacity>
              {currentData.change >= 0 ? (
                <TrendingUp size={16} color={colors.success} />
              ) : (
                <TrendingDown size={16} color={colors.error} />
              )}
              <Text style={{ color: currentData.change >= 0 ? colors.success : colors.error }}>
                {currentData.change >= 0 ? '+' : ''}{currentData.change_percent.toFixed(2)}%
              </Text>
            </View>
          </View>
          
          <Text style={[
            styles.livePriceValue,
            priceLoading && styles.priceLoading
          ]}>
            {priceLoading ? 'Loading...' : `$${currentData.price.toFixed(2)}`}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>High</Text>
              <Text style={styles.statValue}>${currentData.high.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Low</Text>
              <Text style={styles.statValue}>${currentData.low.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Volume</Text>
              <Text style={styles.statValue}>{currentData.volume}</Text>
            </View>
          </View>
        </View>

        <TimeframeSwitcher
          selectedTimeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />

        {/* Chart Container */}
        <View style={styles.chartContainer}>
          {Platform.OS === 'web' ? (
            <iframe
              srcDoc={getTradingViewHTML(selectedAsset)}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontSize: fontSizes.medium }}>
                Chart View - {selectedAsset}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSizes.small, marginTop: 8 }}>
                Connect to TradingView for live charts
              </Text>
            </View>
          )}
        </View>

        {/* Technical Indicators */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Technical Indicators</Text>
          <View style={{ gap: 12 }}>
            {technicalIndicators.map((indicator) => (
              <View key={indicator.id} style={styles.indicatorCard}>
                <View style={styles.indicatorHeader}>
                  <Text style={styles.indicatorName}>{indicator.indicator_name}</Text>
                  <Text style={[styles.indicatorValue, { color: indicator.color }]}>
                    {indicator.value}
                  </Text>
                </View>
                <Text style={[styles.indicatorStatus, { color: indicator.color }]}>
                  {indicator.status}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Economic Events */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Today's Economic Events</Text>
          <View style={{ gap: 12 }}>
            {economicEvents.map(event => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTime}>{event.time}</Text>
                  <View style={[
                    styles.impactBadge,
                    {
                      backgroundColor:
                        event.impact === 'high'
                          ? `${colors.error}33`
                          : event.impact === 'medium'
                            ? `${colors.warning}33`
                            : `${colors.textSecondary}33`,
                    }
                  ]}>
                    <Text style={styles.impactText}>{event.impact.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.eventContent}>
                  <Text style={styles.currencyBadge}>{event.currency}</Text>
                  <Text style={styles.eventName}>{event.event_name}</Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventDetail}>Forecast: {event.forecast}</Text>
                  <Text style={styles.eventDetail}>Previous: {event.previous}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}