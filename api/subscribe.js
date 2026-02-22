export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { email } = req.body;
    
    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }
    
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: 'Email service not configured' });
    }
    
    try {
        // Add contact to SendGrid
        const response = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contacts: [{ email }]
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            console.error('SendGrid error:', error);
            return res.status(500).json({ error: 'Failed to subscribe' });
        }
        
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Subscribe error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
