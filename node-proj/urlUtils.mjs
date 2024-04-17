import axios from 'axios';

export async function getFinalDestination(url) {
    try {
        const response = await axios.head(url, {
            maxRedirects: 0, // Disable auto-redirect
            validateStatus: (status) => {
                // Validate only 2xx and 3xx status codes
                return status >= 200 && status < 400;
            }
        });

        // Check if a redirect occurred
        if (response.headers['location']) {
            // Recursive call to get the final destination
            return await getFinalDestination(response.headers['location']);
        }

        // Remove query string from the final URL
        return url.split('?')[0];
    } catch (error) {
        // Handle any errors
        throw new Error(`Error getting final destination: ${error.message}`);
    }
}