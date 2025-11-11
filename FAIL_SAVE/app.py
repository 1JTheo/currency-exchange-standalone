# import streamlit as st
# import requests
# from datetime import datetime, timedelta

# # Page configuration
# st.set_page_config(
#     page_title="Currency Exchange - Joseph Theophilus Odubena",
#     page_icon="💱",
#     layout="wide",
#     initial_sidebar_state="expanded"
# )

# # Custom CSS for better styling
# st.markdown("""
# <style>
#     .main-header {
#         text-align: center;
#         color: #1f77b4;
#         font-size: 3rem;
#         font-weight: bold;
#         margin-bottom: 1rem;
#     }
#     .sub-header {
#         text-align: center;
#         color: #666;
#         font-size: 1.2rem;
#         margin-bottom: 2rem;
#     }
#     .result-box {
#         background-color: #f0f8ff;
#         padding: 20px;
#         border-radius: 10px;
#         border-left: 5px solid #1f77b4;
#         margin: 20px 0;
#     }
#     .error-box {
#         background-color: #ffe6e6;
#         padding: 15px;
#         border-radius: 5px;
#         border-left: 5px solid #ff4444;
#         margin: 10px 0;
#     }
#     .warning-box {
#         background-color: #fff3cd;
#         padding: 15px;
#         border-radius: 5px;
#         border-left: 5px solid #ffc107;
#         margin: 10px 0;
#     }
#     .footer {
#         text-align: center;
#         color: #666;
#         font-size: 0.9rem;
#         margin-top: 3rem;
#         padding-top: 2rem;
#         border-top: 1px solid #ddd;
#     }
# </style>
# """, unsafe_allow_html=True)

# # Comprehensive currency list with names
# CURRENCY_NAMES = {
#     # Major World Currencies
#     'USD': 'US Dollar',
#     'EUR': 'Euro',
#     'GBP': 'British Pound',
#     'JPY': 'Japanese Yen',
#     'CAD': 'Canadian Dollar',
#     'AUD': 'Australian Dollar',
#     'CHF': 'Swiss Franc',
#     'CNY': 'Chinese Yuan',
#     'INR': 'Indian Rupee',

#     # African Currencies
#     'NGN': 'Nigerian Naira',
#     'ZAR': 'South African Rand',
#     'EGP': 'Egyptian Pound',
#     'MAD': 'Moroccan Dirham',
#     'TND': 'Tunisian Dinar',
#     'KES': 'Kenyan Shilling',
#     'UGX': 'Ugandan Shilling',
#     'TZS': 'Tanzanian Shilling',
#     'GHS': 'Ghanaian Cedi',
#     'XOF': 'West African CFA Franc',
#     'XAF': 'Central African CFA Franc',
#     'BWP': 'Botswana Pula',
#     'MZN': 'Mozambican Metical',
#     'AOA': 'Angolan Kwanza',
#     'ZMW': 'Zambian Kwacha',
#     'RWF': 'Rwandan Franc',
#     'ETB': 'Ethiopian Birr',
#     'MUR': 'Mauritian Rupee',
#     'MWK': 'Malawian Kwacha',

#     # European Currencies
#     'NOK': 'Norwegian Krone',
#     'SEK': 'Swedish Krona',
#     'DKK': 'Danish Krone',
#     'PLN': 'Polish Zloty',
#     'HUF': 'Hungarian Forint',
#     'CZK': 'Czech Koruna',
#     'RON': 'Romanian Leu',
#     'BGN': 'Bulgarian Lev',
#     'HRK': 'Croatian Kuna',

#     # Asian Currencies
#     'KRW': 'South Korean Won',
#     'SGD': 'Singapore Dollar',
#     'HKD': 'Hong Kong Dollar',
#     'THB': 'Thai Baht',
#     'MYR': 'Malaysian Ringgit',
#     'IDR': 'Indonesian Rupiah',
#     'PHP': 'Philippine Peso',

#     # Other Major Currencies
#     'BRL': 'Brazilian Real',
#     'MXN': 'Mexican Peso',
#     'RUB': 'Russian Ruble',
#     'TRY': 'Turkish Lira',
#     'NZD': 'New Zealand Dollar',
#     'ILS': 'Israeli Shekel',

#     # Middle East
#     'AED': 'UAE Dirham',
#     'SAR': 'Saudi Riyal',
#     'QAR': 'Qatari Riyal',
#     'KWD': 'Kuwaiti Dinar',
# }

# # Unsupported currencies (not in Frankfurter API)
# UNSUPPORTED_CURRENCIES = [
#     'NGN', 'KES', 'UGX', 'TZS', 'GHS', 'RWF', 'ETB', 'MWK',
#     'XOF', 'XAF', 'BWP', 'MZN', 'AOA', 'ZMW', 'MAD', 'TND'
# ]

# def get_default_currencies():
#     """Get default currencies based on user's locale"""
#     try:
#         # Try to detect user's country from browser language
#         import streamlit.components.v1 as components

#         # Default fallback
#         from_curr = 'USD'
#         to_curr = 'EUR'

#         # You could add more sophisticated locale detection here
#         return from_curr, to_curr
#     except:
#         return 'USD', 'EUR'

# def fetch_currencies():
#     """Fetch available currencies from Frankfurter API"""
#     try:
#         response = requests.get("https://api.frankfurter.app/currencies", timeout=10)
#         response.raise_for_status()
#         api_currencies = list(response.json().keys())

#         # Add essential African currencies that may not be in API
#         essential_african = [
#             'NGN', 'ZAR', 'EGP', 'MAD', 'TND', 'KES', 'UGX', 'TZS', 'GHS',
#             'XOF', 'XAF', 'BWP', 'MZN', 'AOA', 'ZMW', 'RWF', 'ETB', 'MUR', 'MWK'
#         ]

#         # Major world currencies
#         major_currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR']

#         # Combine all currencies
#         all_currencies = sorted(list(set(api_currencies + essential_african + major_currencies)))

#         return all_currencies
#     except Exception as e:
#         st.error(f"Error fetching currencies: {e}")
#         # Fallback currencies
#         return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR',
#                 'NGN', 'ZAR', 'EGP', 'MAD', 'KES', 'GHS', 'UGX', 'TZS']

# def fetch_exchange_rate(from_curr, to_curr, amount=1.0):
#     """Fetch exchange rate from Frankfurter API"""
#     if from_curr == to_curr:
#         return {
#             'rate': 1.0,
#             'converted_amount': amount,
#             'error': None,
#             'unsupported': None,
#             'temporarily_unavailable': None
#         }

#     # Check for unsupported currencies
#     if from_curr in UNSUPPORTED_CURRENCIES:
#         return {
#             'rate': None,
#             'converted_amount': None,
#             'error': f"{from_curr} is not supported by our exchange rate provider.",
#             'unsupported': from_curr,
#             'temporarily_unavailable': None
#         }

#     if to_curr in UNSUPPORTED_CURRENCIES:
#         return {
#             'rate': None,
#             'converted_amount': None,
#             'error': f"{to_curr} is not supported by our exchange rate provider.",
#             'unsupported': to_curr,
#             'temporarily_unavailable': None
#         }

#     try:
#         url = f"https://api.frankfurter.app/latest?from={from_curr}&to={to_curr}"
#         response = requests.get(url, timeout=10)
#         response.raise_for_status()

#         data = response.json()
#         rate = data['rates'].get(to_curr)

#         if rate:
#             return {
#                 'rate': rate,
#                 'converted_amount': amount * rate,
#                 'error': None,
#                 'unsupported': None,
#                 'temporarily_unavailable': None
#             }
#         else:
#             return {
#                 'rate': None,
#                 'converted_amount': None,
#                 'error': f"Exchange rate for {to_curr} is not available.",
#                 'unsupported': to_curr,
#                 'temporarily_unavailable': None
#             }

#     except requests.exceptions.RequestException as e:
#         return {
#             'rate': None,
#             'converted_amount': None,
#             'error': f"Network error: {str(e)}",
#             'unsupported': None,
#             'temporarily_unavailable': from_curr
#         }
#     except Exception as e:
#         return {
#             'rate': None,
#             'converted_amount': None,
#             'error': f"Unexpected error: {str(e)}",
#             'unsupported': None,
#             'temporarily_unavailable': from_curr
#         }

# def fetch_historical_data(from_curr, to_curr, days=30):
#     """Fetch historical exchange rate data"""
#     try:
#         end_date = datetime.now()
#         start_date = end_date - timedelta(days=days)

#         url = f"https://api.frankfurter.app/{start_date.strftime('%Y-%m-%d')}..{end_date.strftime('%Y-%m-%d')}?from={from_curr}&to={to_curr}"
#         response = requests.get(url, timeout=15)
#         response.raise_for_status()

#         data = response.json()

#         # Process the data
#         dates = []
#         rates = []

#         for date_str, rates_data in sorted(data['rates'].items()):
#             if to_curr in rates_data:
#                 dates.append(date_str)
#                 rates.append(rates_data[to_curr])

#         return dates, rates

#     except Exception as e:
#         st.warning(f"Historical data not available: {e}")
#         return [], []

# def main():
#     # Header
#     st.markdown('<h1 class="main-header">💱 Currency Exchange</h1>', unsafe_allow_html=True)
#     st.markdown('<p class="sub-header">Real-time exchange rates with live historical data</p>', unsafe_allow_html=True)

#     # Sidebar with developer info
#     with st.sidebar:
#         st.header("👨‍💻 Developer")
#         st.markdown("""
#         **Joseph Theophilus Odubena**
#         *Full Stack Developer*

#         Passionate about solving humanity's challenges through technology. Building innovative solutions across various sectors.
#         """)

#         st.markdown("---")
#         st.markdown("### 🔗 Connect")
#         col1, col2 = st.columns(2)
#         with col1:
#             st.markdown("[LinkedIn](https://www.linkedin.com/in/theophilus-odubena-180148180/)")
#         with col2:
#             st.markdown("[GitHub](https://github.com/1JTheo)")

#         st.markdown("---")
#         st.markdown("### 📊 Features")
#         st.markdown("✅ Real-time rates\n✅ Historical data\n✅ 65+ currencies\n✅ Mobile-friendly")

#     # Main content
#     col1, col2 = st.columns([1, 1])

#     with col1:
#         st.subheader("💰 Currency Converter")

#         # Get available currencies
#         currencies = fetch_currencies()

#         # Amount input
#         amount = st.number_input(
#             "Amount",
#             min_value=0.0,
#             value=1.0,
#             step=0.01,
#             format="%.2f"
#         )

#         # Currency selectors
#         col_from, col_to = st.columns(2)

#         with col_from:
#             from_currency = st.selectbox(
#                 "From Currency",
#                 currencies,
#                 index=currencies.index('USD') if 'USD' in currencies else 0,
#                 format_func=lambda x: f"{x} - {CURRENCY_NAMES.get(x, 'Unknown')}"
#             )

#         with col_to:
#             # Default to EUR, but avoid same currency
#             default_to = 'EUR' if from_currency != 'EUR' else 'GBP'
#             to_index = currencies.index(default_to) if default_to in currencies else (1 if len(currencies) > 1 else 0)

#             to_currency = st.selectbox(
#                 "To Currency",
#                 currencies,
#                 index=to_index,
#                 format_func=lambda x: f"{x} - {CURRENCY_NAMES.get(x, 'Unknown')}"
#             )

#         # Convert button
#         if st.button("🔄 Convert", type="primary", use_container_width=True):
#             if from_currency == to_currency:
#                 st.markdown('<div class="warning-box">⚠️ Same currency selected — choose a different currency to compare.</div>', unsafe_allow_html=True)
#             else:
#                 with st.spinner("Fetching exchange rate..."):
#                     result = fetch_exchange_rate(from_currency, to_currency, amount)

#                     if result['error']:
#                         if result['unsupported']:
#                             st.markdown(f'<div class="error-box">❌ {result["unsupported"]} is not supported by our exchange rate provider.</div>', unsafe_allow_html=True)
#                         elif result['temporarily_unavailable']:
#                             st.markdown(f'<div class="warning-box">⚠️ {result["temporarily_unavailable"]} is temporarily unavailable due to network issues.</div>', unsafe_allow_html=True)
#                         else:
#                             st.markdown(f'<div class="error-box">❌ {result["error"]}</div>', unsafe_allow_html=True)
#                     else:
#                         st.markdown('<div class="result-box">', unsafe_allow_html=True)
#                         st.markdown(f"### {result['converted_amount']:.2f} {to_currency}")
#                         st.markdown(f"**Exchange Rate:** 1 {from_currency} = {result['rate']:.6f} {to_currency}")
#                         st.markdown(f"**Last Updated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
#                         st.markdown('</div>', unsafe_allow_html=True)

#     with col2:
#         st.subheader("📈 Historical Trends")

#         if from_currency != to_currency:
#             with st.spinner("Loading historical data..."):
#                 dates, rates = fetch_historical_data(from_currency, to_currency)

#                 if dates and rates:
#                     # Display chart using streamlit's built-in chart
#                     chart_data = {f"{from_currency} to {to_currency}": rates}
#                     st.line_chart(chart_data)

#                     # Show latest data in a simple table
#                     st.markdown("**Recent Rates:**")
#                     recent_data = []
#                     for i in range(max(0, len(dates)-5), len(dates)):
#                         recent_data.append({
#                             "Date": dates[i],
#                             "Rate": f"{rates[i]:.6f}"
#                         })

#                     if recent_data:
#                         st.table(recent_data)

#                     # Statistics
#                     col_stats1, col_stats2, col_stats3 = st.columns(3)
#                     with col_stats1:
#                         st.metric("Current Rate", f"{rates[-1]:.6f}")
#                     with col_stats2:
#                         st.metric("30-Day High", f"{max(rates):.6f}")
#                     with col_stats3:
#                         st.metric("30-Day Low", f"{min(rates):.6f}")
#                 else:
#                     st.info("Historical data not available for this currency pair. This is common for African currencies.")
#         else:
#             st.info("Select different currencies to view historical trends.")

#     # Footer
#     st.markdown("""
#     <div class="footer">
#         <p>© 2025 Joseph Theophilus Odubena - Currency Exchange App<br>
#         Real-time data provided by <a href="https://frankfurter.app" target="_blank">Frankfurter API</a></p>
#     </div>
#     """, unsafe_allow_html=True)

# if __name__ == "__main__":
#     main()
