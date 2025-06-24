import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, DollarSign, Target, Award } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchSignals, Signal } from '../../supabase/signals';

export default function PortfolioScreen() {
  const { colors, fontSizes } = useTheme();
  const [timeframe, setTimeframe] = useState('1D');
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSignals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allSignals = await fetchSignals();
      setSignals(allSignals);
    } catch (err) {
      console.error('Error loading signals:', err);
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSignals();
  }, [loadSignals]);

  // Calculate portfolio stats from signals
  const closedSignals = signals.filter(s => s.status === 'closed');
  const activeSignals = signals.filter(s => s.status === 'active');

  const totalPnL = closedSignals.reduce((sum, signal) => sum + (signal.pnl || 0), 0);
  const winningTrades = closedSignals.filter(s => (s.pnl || 0) > 0).length;
  const winRate = closedSignals.length > 0 ? (winningTrades / closedSignals.length) * 100 : 0;

  const portfolioStats = {
    totalBalance: 12543.67 + totalPnL,
    dailyPnL: totalPnL,
    dailyPnLPercentage: totalPnL > 0 ? 1.91 : -0.85,
    winRate: winRate,
    totalTrades: closedSignals.length,
    activeTrades: activeSignals.length,
  };

  // Get active positions from signals
  const positions = activeSignals.map(signal => ({
    id: signal.id,
    pair: signal.pair,
    type: signal.type,
    size: 0.5, // Mock lot size
    entryPrice: signal.entry_price,
    currentPrice: signal.current_price || signal.entry_price,
    pnl: signal.pnl || 0,
    pnlPercentage: signal.pnl ? ((signal.pnl / (signal.entry_price * 0.5)) * 100) : 0,
  }));

  const timeframes = ['1H', '1D', '1W', '1M'];

  const renderTimeframeButton = (tf: string) => (
    <TouchableOpacity
      key={tf}
      style={[
        styles.timeframeButton,
        timeframe === tf && styles.timeframeButtonActive
      ]}
      onPress={() => setTimeframe(tf)}
    >
      <Text style={[
        styles.timeframeButtonText,
        timeframe === tf && styles.timeframeButtonTextActive
      ]}>
        {tf}
      </Text>
    </TouchableOpacity>
  );

  const renderPosition = (position: any) => (
    <View key={position.id} style={styles.positionCard}>
      <View style={styles.positionHeader}>
        <Text style={styles.pairText}>{position.pair}</Text>
        <View style={[
          styles.typeLabel,
          position.type === 'BUY' ? styles.buyLabel : styles.sellLabel
        ]}>
          <Text style={[
            styles.typeLabelText,
            position.type === 'BUY' ? styles.buyLabelText : styles.sellLabelText
          ]}>
            {position.type}
          </Text>
        </View>
      </View>

      <View style={styles.positionDetails}>
        <View style={styles.positionDetailRow}>
          <Text style={styles.detailLabel}>Size:</Text>
          <Text style={styles.detailValue}>{position.size}</Text>
        </View>
        <View style={styles.positionDetailRow}>
          <Text style={styles.detailLabel}>Entry:</Text>
          <Text style={styles.detailValue}>
            {position.pair.includes('XAU') || position.pair.includes('XAG')
              ? position.entryPrice.toFixed(2)
              : position.entryPrice.toFixed(4)}
          </Text>
        </View>
        <View style={styles.positionDetailRow}>
          <Text style={styles.detailLabel}>Current:</Text>
          <Text style={styles.detailValue}>
            {position.pair.includes('XAU') || position.pair.includes('XAG')
              ? position.currentPrice.toFixed(2)
              : position.currentPrice.toFixed(4)}
          </Text>
        </View>
      </View>

      <View style={styles.pnlContainer}>
        <Text style={[
          styles.pnlAmount,
          position.pnl >= 0 ? styles.profitText : styles.lossText
        ]}>
          {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
        </Text>
        <Text style={[
          styles.pnlPercentage,
          position.pnl >= 0 ? styles.profitText : styles.lossText
        ]}>
          ({position.pnl >= 0 ? '+' : ''}{position.pnlPercentage.toFixed(1)}%)
        </Text>
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: colors.text,
      fontSize: fontSizes.medium,
      fontFamily: 'Inter-Medium',
      marginTop: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorText: {
      color: colors.error,
      fontSize: fontSizes.medium,
      fontFamily: 'Inter-Medium',
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.background,
      fontSize: fontSizes.medium,
      fontFamily: 'Inter-SemiBold',
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    title: {
      fontSize: fontSizes.title + 4,
      fontWeight: 'bold',
      color: colors.text,
      fontFamily: 'Inter-Bold',
      marginBottom: 16,
    },
    timeframeContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    timeframeButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timeframeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    timeframeButtonText: {
      color: colors.textSecondary,
      fontSize: fontSizes.medium,
      fontFamily: 'Inter-Medium',
    },
    timeframeButtonTextActive: {
      color: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    balanceCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    balanceLabel: {
      fontSize: fontSizes.medium,
      color: colors.textSecondary,
      fontFamily: 'Inter-Regular',
      marginBottom: 4,
    },
    balanceAmount: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      fontFamily: 'Inter-Bold',
      marginBottom: 12,
    },
    dailyPnLContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dailyPnL: {
      fontSize: fontSizes.medium,
      fontFamily: 'Inter-SemiBold',
    },
    dailyPnLPercentage: {
      fontSize: fontSizes.medium,
      fontFamily: 'Inter-Medium',
    },
    profitText: {
      color: colors.success,
    },
    lossText: {
      color: colors.error,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      fontSize: fontSizes.subtitle,
      fontWeight: 'bold',
      color: colors.text,
      fontFamily: 'Inter-Bold',
      marginTop: 8,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: fontSizes.small,
      color: colors.textSecondary,
      fontFamily: 'Inter-Regular',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: fontSizes.subtitle,
      fontWeight: 'bold',
      color: colors.text,
      fontFamily: 'Inter-Bold',
    },
    positionCount: {
      fontSize: fontSizes.medium,
      color: colors.textSecondary,
      fontFamily: 'Inter-Regular',
    },
    positionsContainer: {
      gap: 12,
      paddingBottom: 20,
    },
    positionCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    positionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    pairText: {
      fontSize: fontSizes.subtitle,
      fontWeight: 'bold',
      color: colors.text,
      fontFamily: 'Inter-Bold',
    },
    typeLabel: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    buyLabel: {
      backgroundColor: `${colors.success}20`,
    },
    sellLabel: {
      backgroundColor: `${colors.error}20`,
    },
    typeLabelText: {
      fontSize: fontSizes.small,
      fontFamily: 'Inter-SemiBold',
    },
    buyLabelText: {
      color: colors.success,
    },
    sellLabelText: {
      color: colors.error,
    },
    positionDetails: {
      gap: 6,
      marginBottom: 12,
    },
    positionDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    detailLabel: {
      fontSize: fontSizes.medium,
      color: colors.textSecondary,
      fontFamily: 'Inter-Regular',
    },
    detailValue: {
      fontSize: fontSizes.medium,
      color: colors.text,
      fontFamily: 'Inter-Medium',
    },
    pnlContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pnlAmount: {
      fontSize: fontSizes.medium,
      fontFamily: 'Inter-SemiBold',
    },
    pnlPercentage: {
      fontSize: fontSizes.medium,
      fontFamily: 'Inter-Medium',
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Portfolio...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSignals}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio</Text>
        <View style={styles.timeframeContainer}>
          {timeframes.map(renderTimeframeButton)}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            ${portfolioStats.totalBalance.toLocaleString()}
          </Text>
          <View style={styles.dailyPnLContainer}>
            {portfolioStats.dailyPnL >= 0 ? (
              <TrendingUp size={16} color={colors.success} />
            ) : (
              <TrendingDown size={16} color={colors.error} />
            )}
            <Text style={[
              styles.dailyPnL,
              portfolioStats.dailyPnL >= 0 ? styles.profitText : styles.lossText
            ]}>
              {portfolioStats.dailyPnL >= 0 ? '+' : ''}${portfolioStats.dailyPnL.toFixed(2)}
            </Text>
            <Text style={[
              styles.dailyPnLPercentage,
              portfolioStats.dailyPnL >= 0 ? styles.profitText : styles.lossText
            ]}>
              ({portfolioStats.dailyPnL >= 0 ? '+' : ''}{portfolioStats.dailyPnLPercentage.toFixed(2)}%)
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Target size={24} color={colors.success} />
            <Text style={styles.statValue}>{portfolioStats.winRate.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={24} color={colors.secondary} />
            <Text style={styles.statValue}>{portfolioStats.totalTrades}</Text>
            <Text style={styles.statLabel}>Total Trades</Text>
          </View>
          <View style={styles.statCard}>
            <Award size={24} color={colors.warning} />
            <Text style={styles.statValue}>{portfolioStats.activeTrades}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {/* Active Positions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Positions</Text>
          <Text style={styles.positionCount}>
            {positions.length} position{positions.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.positionsContainer}>
          {positions.length === 0 ? (
            <View style={styles.positionCard}>
              <Text style={styles.detailLabel}>No active positions</Text>
            </View>
          ) : (
            positions.map(renderPosition)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}