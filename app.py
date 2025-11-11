import streamlit as st
import requests
import plotly.graph_objects as go
from datetime import datetime, timedelta

st.set_page_config(
    page_title="Currency Exchange",
    page_icon="💱",
    layout="wide"
)

st.title("💱 Currency Exchange")
st.markdown("Real-time currency converter with historical data")

# Currency options including African currencies
currencies = [
    "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR",
    "NGN", "ZAR", "EGP", "MAD", "TND", "KES", "UGX", "TZS", "GHS",
    "XOF", "XAF", "BWP", "MZN", "AOA", "ZMW", "RWF", "ETB", "MUR", "MWK"
]

col1, col2, col3 = st.columns([1, 0.2, 1])

with col1:
    amount = st.number_input("Amount", value=1.0, min_value=0.01, step=0.01)
    from_currency = st.selectbox("From Currency", currencies, index=currencies.index("NGN"))

with col2:
    st.markdown("<br><br>", unsafe_allow_html=True)
    if st.button("🔄"):
        from_currency, to_currency = to_currency, from_currency
        st.rerun()

with col3:
    to_currency = st.selectbox("To Currency", currencies, index=currencies.index("USD"))

# Fetch exchange rate
try:
    response = requests.get(f"https://api.frankfurter.app/latest?from={from_currency}&to={to_currency}")
    if response.status_code == 200:
        data = response.json()
        rate = data['rates'][to_currency]
        converted_amount = amount * rate

        st.success(f"{amount} {from_currency} = {converted_amount:.2f} {to_currency}")
        st.info(f"Exchange rate: 1 {from_currency} = {rate:.4f} {to_currency}")
    else:
        st.error("Failed to fetch exchange rate")
except Exception as e:
    st.error(f"Error: {str(e)}")

# Historical data chart
st.subheader("📈 Historical Exchange Rate (Last 30 Days)")

try:
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)

    response = requests.get(
        f"https://api.frankfurter.app/{start_date.strftime('%Y-%m-%d')}..{end_date.strftime('%Y-%m-%d')}?from={from_currency}&to={to_currency}"
    )

    if response.status_code == 200:
        hist_data = response.json()
        dates = list(hist_data['rates'].keys())
        rates = [hist_data['rates'][date][to_currency] for date in dates]

        # Create simple chart data without pandas
        chart_data = []
        for i, date in enumerate(dates):
            chart_data.append({"date": date, "rate": rates[i]})

        # Create plotly chart
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=dates,
            y=rates,
            mode='lines+markers',
            name=f"{from_currency}/{to_currency}",
            line=dict(color='#2563eb', width=2),
            marker=dict(size=6, color='#2563eb')
        ))

        fig.update_layout(
            title=f"{from_currency} to {to_currency} Exchange Rate (30 Days)",
            xaxis_title="Date",
            yaxis_title="Exchange Rate",
            template="plotly_white",
            height=400
        )

        st.plotly_chart(fig, use_container_width=True)
    else:
        st.warning("Historical data not available for this currency pair")
except Exception as e:
    st.error(f"Error fetching historical data: {str(e)}")

# Developer info
st.markdown("---")
st.markdown("### 👨‍💻 Developer")
st.markdown("**Joseph Theophilus Odubena**")
st.markdown("*Full Stack Developer*")
st.markdown("Passionate about solving humanity's challenges through technology.")
st.markdown("[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/theophilus-odubena-180148180/)")