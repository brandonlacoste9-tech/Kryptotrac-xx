// Test script to verify CoinGecko API key works
// Run with: node scripts/test-coingecko.js

const COINGECKO_API = "https://api.coingecko.com/api/v3"
const API_KEY = "CG-3SvnagJo5kkEe7DAMPwPsc1U"

async function testCoinGeckoAPI() {
    console.log("🔍 Testing CoinGecko API Key...\n")

    const headers = {
        'Accept': 'application/json',
        'x-cg-pro-api-key': API_KEY
    }

    try {
        // Test 1: Simple price check
        console.log("Test 1: Fetching Bitcoin price...")
        const priceResponse = await fetch(
            `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`,
            { headers }
        )

        if (!priceResponse.ok) {
            throw new Error(`HTTP ${priceResponse.status}: ${priceResponse.statusText}`)
        }

        const priceData = await priceResponse.json()
        console.log("✅ Success! BTC Price:", `$${priceData.bitcoin.usd.toLocaleString()}`)
        console.log()

        // Test 2: Search function
        console.log("Test 2: Searching for 'ethereum'...")
        const searchResponse = await fetch(
            `${COINGECKO_API}/search?query=ethereum`,
            { headers }
        )

        if (!searchResponse.ok) {
            throw new Error(`HTTP ${searchResponse.status}: ${searchResponse.statusText}`)
        }

        const searchData = await searchResponse.json()
        console.log("✅ Success! Found:", searchData.coins.length, "results")
        console.log("Top result:", searchData.coins[0].name, `(${searchData.coins[0].symbol})`)
        console.log()

        // Test 3: Market data
        console.log("Test 3: Fetching top 5 coins...")
        const marketResponse = await fetch(
            `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1`,
            { headers }
        )

        if (!marketResponse.ok) {
            throw new Error(`HTTP ${marketResponse.status}: ${marketResponse.statusText}`)
        }

        const marketData = await marketResponse.json()
        console.log("✅ Success! Top 5 coins by market cap:")
        marketData.forEach((coin, i) => {
            console.log(`${i + 1}. ${coin.name} (${coin.symbol.toUpperCase()}) - $${coin.current_price.toLocaleString()}`)
        })
        console.log()

        // Check rate limits from response headers
        const rateLimitRemaining = marketResponse.headers.get('x-ratelimit-remaining')
        const rateLimitLimit = marketResponse.headers.get('x-ratelimit-limit')

        if (rateLimitRemaining && rateLimitLimit) {
            console.log("📊 Rate Limit Status:")
            console.log(`   Remaining: ${rateLimitRemaining}/${rateLimitLimit} calls`)
        }

        console.log("\n🎉 All tests passed! Your CoinGecko API key is working perfectly!")
        console.log("   API Key: CG-***" + API_KEY.slice(-8))

    } catch (error) {
        console.error("\n❌ Test failed:", error.message)

        if (error.message.includes('401')) {
            console.log("\n⚠️  Authentication failed. Possible issues:")
            console.log("   - API key might be invalid or expired")
            console.log("   - Check your CoinGecko account status")
        } else if (error.message.includes('429')) {
            console.log("\n⚠️  Rate limit exceeded")
            console.log("   - Too many requests in a short time")
            console.log("   - Wait a few seconds and try again")
        } else if (error.message.includes('403')) {
            console.log("\n⚠️  Access forbidden. Check:")
            console.log("   - API key has correct permissions")
            console.log("   - Account is in good standing")
        }
    }
}

// Run the test
testCoinGeckoAPI()
