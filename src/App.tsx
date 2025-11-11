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
  AlertTriangle,
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
          throw new Error('Historical data not available for this currency pair');
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
          throw new Error('No historical data points available');
        }
        
        setChartData(historicalRates);
      } catch (err) {
        console.error('Error fetching historical data:', err);
        
        // African currencies often don't have historical data, so generate realistic fallback
        const africanCurrencies = ['NGN', 'ZAR', 'EGP', 'MAD', 'KES', 'GHS', 'UGX', 'TZS', 'XOF', 'XAF'];
        const isAfricanPair = africanCurrencies.includes(fromCurrency) || africanCurrencies.includes(toCurrency);
        
        if (isAfricanPair) {
          setError('Historical data limited for African currencies - showing trend simulation');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load historical data');
        }
        
        // Generate more realistic trend data
        const generateTrendData = () => {
          const data = [];
          // Start with a reasonable base value for currency conversion
          let baseValue = Math.random() * 2 + 0.5;
          
          // Create more realistic currency fluctuation (±5% variation)
          for (let i = 0; i < 12; i++) {
            const variation = (Math.random() - 0.5) * 0.1; // ±5% max variation
            baseValue = Math.max(0.001, baseValue * (1 + variation));
            data.push(baseValue);
          }
          return data;
        };
        
        setChartData(generateTrendData());
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
        {error && error.includes('African currencies') 
          ? 'Trend simulation' 
          : 'Last 30 days'}
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
  // Comprehensive currency names
  const currencyNames: Record<string, string> = {
    // Major World Currencies
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    INR: 'Indian Rupee',
    
    // African Currencies
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
    MWK: 'Malawian Kwacha',
    
    // European Currencies
    NOK: 'Norwegian Krone',
    SEK: 'Swedish Krona',
    DKK: 'Danish Krone',
    PLN: 'Polish Zloty',
    HUF: 'Hungarian Forint',
    CZK: 'Czech Koruna',
    RON: 'Romanian Leu',
    BGN: 'Bulgarian Lev',
    HRK: 'Croatian Kuna',
    
    // Asian Currencies
    KRW: 'South Korean Won',
    SGD: 'Singapore Dollar',
    HKD: 'Hong Kong Dollar',
    THB: 'Thai Baht',
    MYR: 'Malaysian Ringgit',
    IDR: 'Indonesian Rupiah',
    PHP: 'Philippine Peso',
    
    // Other Major Currencies
    BRL: 'Brazilian Real',
    MXN: 'Mexican Peso',
    RUB: 'Russian Ruble',
    TRY: 'Turkish Lira',
    NZD: 'New Zealand Dollar',
    ILS: 'Israeli Shekel',
    
    // Middle East
    AED: 'UAE Dirham',
    SAR: 'Saudi Riyal',
    QAR: 'Qatari Riyal',
    KWD: 'Kuwaiti Dinar',
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
  const [fromCurrency, setFromCurrency] = useState<string>("");
  const [toCurrency, setToCurrency] = useState<string>("");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [unsupportedCurrency, setUnsupportedCurrency] = useState<string | null>(null);
  const [temporarilyUnavailableCurrency, setTemporarilyUnavailableCurrency] = useState<string | null>(null);

  // Helper: map country code to currency code
  const countryToCurrency: Record<string, string> = {
    US: 'USD',
    GB: 'GBP',
    NG: 'NGN',
    ZA: 'ZAR',
    KE: 'KES',
    GH: 'GHS',
    UG: 'UGX',
    TZ: 'TZS',
    MA: 'MAD',
    EG: 'EGP',
    CA: 'CAD',
    AU: 'AUD',
    EU: 'EUR',
    FR: 'EUR',
    DE: 'EUR',
    IT: 'EUR',
    ES: 'EUR',
    IN: 'INR',
    JP: 'JPY',
    CN: 'CNY',
    BR: 'BRL',
    // ...add more as needed
  };

    function getDefaultCurrency(currencies: string[]): string {
      let country = undefined;
      if (navigator.languages && navigator.languages.length > 0) {
        country = navigator.languages[0].split('-')[1];
      } else if (navigator.language) {
        country = navigator.language.split('-')[1];
      }
      let currency = countryToCurrency[country || ''] || 'EUR';
      if (!currencies.includes(currency)) currency = 'EUR';
      return currency;
    }

  // Set default currencies after currencies are loaded
  useEffect(() => {
    if (currencies.length > 0 && !fromCurrency && !toCurrency) {
      const detected = getDefaultCurrency(currencies);
      setFromCurrency(detected);
      setToCurrency('USD');
    }
  }, [currencies]);

  // Prevent same currency selection
  useEffect(() => {
    if (fromCurrency && toCurrency && fromCurrency === toCurrency) {
      // If same currency selected, switch to a sensible default
      const defaultPairs: Record<string, string> = {
        'USD': 'EUR',
        'EUR': 'USD',
        'GBP': 'USD',
        'JPY': 'USD',
        'CAD': 'USD',
        'AUD': 'USD',
        'CHF': 'EUR',
        'CNY': 'USD',
        'INR': 'USD',
        'NGN': 'USD',
        'ZAR': 'USD',
        'EGP': 'USD',
        'KES': 'USD',
        'GHS': 'USD',
        'UGX': 'USD',
        'TZS': 'USD',
        'MAD': 'EUR',
      };

      const newToCurrency = defaultPairs[fromCurrency] || 'USD';
      setToCurrency(newToCurrency);
    }
  }, [fromCurrency, toCurrency]);
  // Fetch available currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch("https://api.frankfurter.app/currencies");
        const data = await res.json();
        const apiCurrencies = Object.keys(data);
        
        // Essential African currencies (some may not be in Frankfurter API)
        const essentialAfricanCurrencies = [
          'NGN', 'ZAR', 'EGP', 'MAD', 'TND', 'KES', 'UGX', 'TZS', 'GHS', 
          'XOF', 'XAF', 'BWP', 'MZN', 'AOA', 'ZMW', 'RWF', 'ETB', 'MUR', 'MWK'
        ];
        
        // Major world currencies
        const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];
        
        // Combine all currencies: API currencies + essential African currencies + major currencies
        const allCurrencies = Array.from(new Set([
          ...apiCurrencies,
          ...essentialAfricanCurrencies,
          ...majorCurrencies
        ])).sort();
        
        setCurrencies(allCurrencies);
        console.log(`Loaded ${allCurrencies.length} currencies including African currencies not in API`);
        
        // Check which African currencies are missing from API
        const missingAfricanCurrencies = essentialAfricanCurrencies.filter(curr => !apiCurrencies.includes(curr));
        if (missingAfricanCurrencies.length > 0) {
          console.log('African currencies not supported by API (will use fallback rates):', missingAfricanCurrencies);
        }
        
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
  setUnsupportedCurrency(null);
  setTemporarilyUnavailableCurrency(null);
      
      // List of currencies not supported by Frankfurter API
      const unsupported = ['NGN', 'KES', 'UGX', 'TZS', 'GHS', 'RWF', 'ETB', 'MWK', 'XOF', 'XAF', 'BWP', 'MZN', 'AOA', 'ZMW', 'MAD', 'TND'];
      if (unsupported.includes(fromCurrency)) {
        setUnsupportedCurrency(fromCurrency);
        setExchangeRate(null);
        setConvertedAmount(null);
        setLoading(false);
        return;
      }
      if (unsupported.includes(toCurrency)) {
        setUnsupportedCurrency(toCurrency);
        setExchangeRate(null);
        setConvertedAmount(null);
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch(
          `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`
        );
        if (res.ok) {
          const data = await res.json();
          const rate = data.rates[toCurrency];
          if (rate) {
            setExchangeRate(rate);
            setConvertedAmount((parseFloat(amount) || 0) * rate);
            setLastUpdated(new Date());
          } else {
            setUnsupportedCurrency(toCurrency);
            setExchangeRate(null);
            setConvertedAmount(null);
          }
        } else {
          setTemporarilyUnavailableCurrency(fromCurrency);
          setExchangeRate(null);
          setConvertedAmount(null);
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        setTemporarilyUnavailableCurrency(fromCurrency);
        setExchangeRate(null);
        setConvertedAmount(null);
      } finally {
        setLoading(false);
      }
    };
    fetchExchangeRate();
  }, [fromCurrency, toCurrency, amount]);

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
      setUnsupportedCurrency(null);
      setTemporarilyUnavailableCurrency(null);
      // List of currencies not supported by Frankfurter API
      const unsupported = ['NGN', 'KES', 'UGX', 'TZS', 'GHS', 'RWF', 'ETB', 'MWK', 'XOF', 'XAF', 'BWP', 'MZN', 'AOA', 'ZMW', 'MAD', 'TND'];
      if (unsupported.includes(fromCurrency)) {
        setUnsupportedCurrency(fromCurrency);
        setExchangeRate(null);
        setConvertedAmount(null);
        setLoading(false);
        return;
      }
      if (unsupported.includes(toCurrency)) {
        setUnsupportedCurrency(toCurrency);
        setExchangeRate(null);
        setConvertedAmount(null);
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch(
          `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`
        );
        if (res.ok) {
          const data = await res.json();
          const rate = data.rates[toCurrency];
          if (rate) {
            setExchangeRate(rate);
            setConvertedAmount((parseFloat(amount) || 0) * rate);
            setLastUpdated(new Date());
          } else {
            setUnsupportedCurrency(toCurrency);
            setExchangeRate(null);
            setConvertedAmount(null);
          }
        } else {
          setTemporarilyUnavailableCurrency(fromCurrency);
          setExchangeRate(null);
          setConvertedAmount(null);
        }
      } catch (error) {
        console.error("Error refreshing rate:", error);
        setTemporarilyUnavailableCurrency(fromCurrency);
        setExchangeRate(null);
        setConvertedAmount(null);
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
                  {unsupportedCurrency ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <AlertTriangle className="text-orange-400" size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-orange-300 mb-2">
                        {unsupportedCurrency} Not Supported
                      </h3>
                      <p className="text-orange-200/80 text-sm">
                        {unsupportedCurrency} is not supported by our exchange rate provider.
                      </p>
                      <p className="text-orange-200/60 text-xs mt-2">
                        Please select a different currency or try again later.
                      </p>
                    </div>
                  ) : temporarilyUnavailableCurrency ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <AlertTriangle className="text-orange-400" size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-orange-300 mb-2">
                        {temporarilyUnavailableCurrency} Temporarily Unavailable
                      </h3>
                      <p className="text-orange-200/80 text-sm">
                        {temporarilyUnavailableCurrency} is temporarily unavailable.
                      </p>
                      <p className="text-orange-200/60 text-xs mt-2">
                        Please select a different currency or try again later.
                      </p>
                    </div>
                  ) : (
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
                        disabled={loading || Boolean(unsupportedCurrency)}
                        className="h-10 w-10 rounded-full glass hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Refresh rate"
                      >
                        <RefreshCwIcon size={18} className={`text-blue-300 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart Section */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  <BarChart3Icon size={20} className="mr-2" />
                  Exchange Rate History
                </h3>
                <p className="text-xs text-white/60 mb-4">
                  {/* Show different message for African currencies */}
                  {['NGN', 'ZAR', 'EGP', 'MAD', 'KES', 'GHS', 'UGX', 'TZS', 'XOF', 'XAF'].some(curr => 
                    fromCurrency === curr || toCurrency === curr) 
                    ? "Limited historical data for African currencies - trend simulation shown"
                    : "Last 30 days trend"}
                </p>
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
          <p className="text-white/50 text-sm mb-4">
            © 2025 Joseph Theophilus Odubena - Currency Exchange App. Real-time data provided by Frankfurter API.
          </p>
          
          {/* Developer Info */}
          <div className="glass rounded-2xl p-6 mb-6 max-w-lg mx-auto">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                JTO
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">Joseph Theophilus Odubena</h3>
            <p className="text-blue-200 text-sm mb-2">Full Stack Developer</p>
            <p className="text-white/80 text-xs mb-3 leading-relaxed">
              Passionate about solving humanity's challenges through technology.<br/>
              Building innovative solutions across various sectors.
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://www.linkedin.com/in/theophilus-odubena-180148180/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 transition-colors"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd"/>
                </svg>
              </a>
              <a
                href="https://github.com/1JTheo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 transition-colors"
                aria-label="GitHub Profile"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="flex justify-center space-x-6 text-white/40 text-xs">
            <span>✓ Real-time rates</span>
            <span>✓ Historical data</span>
            <span>✓ 65+ currencies</span>
            <span>✓ Mobile-friendly</span>
          </div>
        </div>
      </div>
    </div>
  );
}