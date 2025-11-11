import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  DollarSignIcon,
  BarChart3Icon,
  GlobeIcon,
  ClockIcon,
} from "lucide-react";

function CurrencyChart({
  fromCurrency,
  toCurrency,
}: {
  fromCurrency: string;
  toCurrency: string;
}) {
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!fromCurrency || !toCurrency) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);

        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        
        const response = await fetch(
          `https://api.frankfurter.app/${formatDate(startDate)}..${formatDate(endDate)}?from=${fromCurrency}&to=${toCurrency}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch historical data');
        }
        
        const data = await response.json();
        const historicalRates: number[] = [];
        const sortedDates = Object.keys(data.rates).sort();
        
        const sampleSize = 12;
        const step = Math.max(1, Math.floor(sortedDates.length / sampleSize));
        
        for (let i = 0; i < sortedDates.length; i += step) {
          const date = sortedDates[i];
          const rate = data.rates[date][toCurrency];
          if (rate) {
            historicalRates.push(rate);
          }
        }
        
        if (historicalRates.length === 0) {
          throw new Error('No historical data available');
        }
        
        setChartData(historicalRates);
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        
        // Fallback to mock data
        const fallbackData = [];
        let value = Math.random() * 0.5 + 0.75;
        for (let i = 0; i < 12; i++) {
          value = value + (Math.random() - 0.5) * 0.1;
          fallbackData.push(value);
        }
        setChartData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [fromCurrency, toCurrency]);

  if (loading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
      </div>
    );
  }

  const maxValue = Math.max(...chartData);
  const minValue = Math.min(...chartData);
  const range = maxValue - minValue || 1;

  return (
    <div className="h-[200px] relative">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-600/20 text-yellow-200 text-xs p-2 rounded mb-2">
          Using sample data: {error}
        </div>
      )}
      <div className="absolute inset-0 flex items-end space-x-1">
        {chartData.map((value, index) => {
          const height = ((value - minValue) / range) * 100;
          return (
            <div
              key={index}
              className="flex-1 bg-blue-400/70 hover:bg-blue-300/80 transition-all duration-300 rounded-t group relative cursor-pointer"
              style={{
                height: `${Math.max(height, 2)}%`,
              }}
              title={`Rate: ${value.toFixed(4)}`}
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {value.toFixed(4)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/30" />
      <div className="absolute bottom-2 left-2 text-xs text-white/70 flex items-center">
        <ClockIcon size={12} className="mr-1" />
        Last 30 days
      </div>
    </div>
  );
}

function CurrencyInput({
  value,
  onChange,
  currency,
}: {
  value: string;
  onChange: (value: string) => void;
  currency: string;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-xl font-semibold bg-white/10 backdrop-blur rounded-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all"
        placeholder="0.00"
        min="0"
        step="0.01"
      />
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 text-sm font-medium">
        {currency}
      </div>
    </div>
  );
}

function CurrencySelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  // Currency names for better UX
  const currencyNames: Record<string, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    INR: 'Indian Rupee',
    NGN: 'Nigerian Naira',
    ZAR: 'South African Rand',
    EGP: 'Egyptian Pound',
    MAD: 'Moroccan Dirham',
    TND: 'Tunisian Dinar',
    KES: 'Kenyan Shilling',
    UGX: 'Ugandan Shilling',
    TZS: 'Tanzanian Shilling',
    GHS: 'Ghanaian Cedi',
    XOF: 'West African CFA Franc',
    XAF: 'Central African CFA Franc',
    BWP: 'Botswana Pula',
    MZN: 'Mozambican Metical',
    AOA: 'Angolan Kwanza',
    ZMW: 'Zambian Kwacha',
    RWF: 'Rwandan Franc',
    ETB: 'Ethiopian Birr',
    MUR: 'Mauritian Rupee',
    MWK: 'Malawian Kwacha'
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-white/10 backdrop-blur rounded-xl border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all appearance-none cursor-pointer"
    >
      {options.map((currency) => (
        <option key={currency} value={currency} className="bg-gray-800 text-white">
          {currency} {currencyNames[currency] ? `- ${currencyNames[currency]}` : ''}
        </option>
      ))}
    </select>
  );
}

export default function App() {
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>("NGN");
  const [toCurrency, setToCurrency] = useState<string>("USD");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch available currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch("https://api.frankfurter.app/currencies");
        const data = await res.json();
        const availableCurrencies = Object.keys(data);
        
        // Enhanced fallback currencies including African currencies
        const fallbackCurrencies = [
          'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR',
          'ZAR', 'EGP', 'MAD', 'TND', 'KES', 'UGX', 'TZS', 'GHS', 'XOF',
          'XAF', 'BWP', 'MZN', 'AOA', 'ZMW', 'RWF', 'ETB', 'MUR', 'MWK'
        ];
        
        // Combine available currencies with fallback, removing duplicates and sorting
        const combinedCurrencies = Array.from(new Set([...availableCurrencies, ...fallbackCurrencies]))
          .sort();
        
        setCurrencies(combinedCurrencies);
        console.log(`Loaded ${combinedCurrencies.length} currencies including African currencies`);
      } catch (error) {
        console.error("Error fetching currencies:", error);
        // Comprehensive fallback including African currencies
        const fallbackCurrencies = [
          'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR',
          'NGN', 'ZAR', 'EGP', 'MAD', 'TND', 'KES', 'UGX', 'TZS', 'GHS', 
          'XOF', 'XAF', 'BWP', 'MZN', 'AOA', 'ZMW', 'RWF', 'ETB', 'MUR', 'MWK'
        ].sort();
        setCurrencies(fallbackCurrencies);
      }
    };
    fetchCurrencies();
  }, []);

  // Fetch conversion rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!fromCurrency || !toCurrency) return;
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`
        );
        const data = await res.json();
        const rate = data.rates[toCurrency];
        setExchangeRate(rate);
        setConvertedAmount((parseFloat(amount) || 0) * rate);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (exchangeRate) {
      setConvertedAmount((parseFloat(value) || 0) * exchangeRate);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const refreshRate = async () => {
    if (fromCurrency && toCurrency) {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`
        );
        const data = await res.json();
        const rate = data.rates[toCurrency];
        setExchangeRate(rate);
        setConvertedAmount((parseFloat(amount) || 0) * rate);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error refreshing rate:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/10 backdrop-blur rounded-full p-4 animate-float">
              <DollarSignIcon size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-gradient bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Currency Exchange
          </h1>
          <p className="text-xl text-white/80 mb-2">
            Real-time exchange rates with live historical data
          </p>
          <div className="flex items-center justify-center text-white/60 text-sm">
            <GlobeIcon size={16} className="mr-2" />
            <span>Powered by Frankfurter API</span>
            {lastUpdated && (
              <>
                <span className="mx-2">•</span>
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Main Converter */}
        <div className="glass rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Converter Section */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/90 mb-1 flex items-center">
                    <BarChart3Icon size={16} className="mr-2" />
                    Amount
                  </label>
                  <CurrencyInput
                    value={amount}
                    onChange={handleAmountChange}
                    currency={fromCurrency}
                  />
                </div>
                
              {/* Popular African Currencies Quick Select */}
              <div className="mt-4">
                <p className="text-xs text-white/60 mb-2">Popular African Currencies:</p>
                <div className="flex flex-wrap gap-2">
                  {['NGN', 'ZAR', 'EGP', 'KES', 'GHS', 'UGX', 'TZS', 'MAD'].map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setFromCurrency(curr)}
                      className={`px-3 py-1 text-xs rounded-full transition-all ${
                        fromCurrency === curr 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">
                      From
                    </label>
                    <CurrencySelect
                      value={fromCurrency}
                      onChange={setFromCurrency}
                      options={currencies}
                    />
                  </div>
                  <button
                    onClick={swapCurrencies}
                    className="h-12 w-12 rounded-full glass hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                    aria-label="Swap currencies"
                  >
                    <div className="flex flex-row transition-transform group-hover:rotate-180 duration-300">
                      <ArrowDownIcon size={16} className="text-blue-300 rotate-90" />
                      <ArrowUpIcon size={16} className="text-blue-300 rotate-90" />
                    </div>
                  </button>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">
                      To
                    </label>
                    <CurrencySelect
                      value={toCurrency}
                      onChange={setToCurrency}
                      options={currencies}
                    />
                  </div>
                </div>

                {/* Result */}
                <div className="glass rounded-2xl p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-white/70 mb-1">Converted Amount</p>
                      {loading ? (
                        <div className="h-10 bg-white/20 loading-shimmer rounded mt-1"></div>
                      ) : (
                        <p className="text-3xl md:text-4xl font-bold text-white">
                          {convertedAmount?.toFixed(2)} {toCurrency}
                        </p>
                      )}
                      {exchangeRate && (
                        <p className="text-sm text-white/70 mt-3 flex items-center">
                          <TrendingUpIcon size={14} className="mr-1" />
                          <span>
                            1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
                          </span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={refreshRate}
                      disabled={loading}
                      className="h-10 w-10 rounded-full glass hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Refresh rate"
                    >
                      <RefreshCwIcon size={18} className={`text-blue-300 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <BarChart3Icon size={20} className="mr-2" />
                  Exchange Rate History
                </h3>
                <CurrencyChart
                  fromCurrency={fromCurrency}
                  toCurrency={toCurrency}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-white/50 text-sm">
            © 2025 Currency Exchange App. Real-time data provided by Frankfurter API.
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-white/40 text-xs">
            <span>✓ Real-time rates</span>
            <span>✓ Historical data</span>
            <span>✓ 30+ currencies</span>
            <span>✓ Mobile-friendly</span>
          </div>
        </div>
      </div>
    </div>
  );
}