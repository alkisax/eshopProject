import { Typography, Paper, Box } from "@mui/material";

const AdminAnalyticsPanel = () => {
  return (
    <Paper sx={{ p: 2, height: "85vh" }}>
      <Typography variant="h5" gutterBottom>
        Google Analytics
      </Typography>

      <Box sx={{ height: "100%", mt: 2 }}>
        <iframe
          width="100%"
          height="100%"
          src="https://lookerstudio.google.com/embed/reporting/e233f866-7aee-45c5-88f6-639d1eb308f4/page/6gwYF"
          style={{ border: 0 }}
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </Box>
    </Paper>
  );
};

export default AdminAnalyticsPanel;

/*
1. Open Looker Studio
Go to https://lookerstudio.google.com/

Make sure you’re logged into the same Google account that owns your GA4 property.

2. Create a new Report

Click “Blank Report”.
It will prompt you to add a data source.
Choose Google Analytics.
Pick your GA4 property (you’ll see the same property ID *** that you saw in Admin).
Select the web stream for your deployed site (https://eshopproject-ggmn.onrender.com).

3. Build your dashboard

Add components (tables, charts, scorecards) by clicking Insert → choose e.g. “Time series chart” for page views.
Common widgets to add:
Active Users (last 30 minutes / 7 days).
Page Views per Page.
Top Countries of users.
Events like view_item, add_to_cart.
You can drag and drop, resize, and format.

4. Enable embedding

In the report, go to File → Embed report.
Toggle on Enable embedding.
Copy the <iframe> code it gives you.
*/

/*
<iframe width="600" height="450" src="https://lookerstudio.google.com/embed/reporting/e233f866-7aee-45c5-88f6-639d1eb308f4/page/6gwYF" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>
*/

/*
DID NOT FOLLOW THIS PATH
💥 Step 1: 
Enable the API in Google Cloud
Go to Google Cloud Console → Library
Search for Google Analytics Data API.
Click Enable.
🚀 Step 2: Create a Service Account
In Google Cloud Console → Credentials
Click Create Credentials → Service Account.
Fill in:
Service account name: e.g. eshop-analytics-service.
Role: Basic → Viewer (enough, since we’re only reading data).
Finish → you’ll see the new service account in the list.
Click your new service account → Keys → Add Key → Create new key → JSON.
Download the JSON file → keep it safe (this contains private keys).
Move it to your backend project, e.g. backend/config/ga-service-account.json.
⚠️ Never commit this file to GitHub.
Add to .gitignore.
🚨 Step 3: Give this service account access to GA4 property
Go to Google Analytics → Admin
Under your property → Property Access Management.
Add the service account email (looks like eshop-analytics-service@your-project-id.iam.gserviceaccount.com).
Give it the role Viewer or Analyst.
*/
