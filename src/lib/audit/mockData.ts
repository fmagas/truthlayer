export const mockOpportunityCsv = `Opportunity ID,Account Name,Company,Stage,Amount,ARR,Close Date,Expected Close Date,Owner,Last Activity Date,Next Step,Forecast Category,Region,Source,Close Date Changes,Notes
OPP-1001,Atlas Foods,Atlas Foods,Negotiation,128000,126000,2026-04-25,2026-05-15,Maya Chen,2026-04-03,,Commit,DACH,Outbound,3,
OPP-1002,Northstar Bio,Northstar Bio,Discovery,91000,0,2026-05-30,2026-05-30,Eli Brooks,2026-05-01,Technical workshop,Commit,UK,Inbound,0,Buyer asked for security review
OPP-1003,Juniper Works,Juniper Works,Proposal,54000,120000,2026-06-12,2026-06-12,,2026-04-15,,Best Case,US,Partner,1,
OPP-1004,HelioGrid,HelioGrid,Procurement,214000,214000,2026-05-03,2026-05-03,Noah Reed,2026-04-01,,Commit,DACH,Outbound,4,Legal waiting
OPP-1005,Cobalt Systems,Cobalt Systems,Qualification,38000,36000,2026-07-04,2026-07-04,Ava Morgan,2026-05-06,Pilot scope,Pipeline,France,Web,0,
OPP-1006,Summit Logistics,Summit Logistics,Legal,76000,76000,2026-04-30,2026-05-20,Luis Ortega,2026-04-02,,Commit,UK,Outbound,2,
OPP-1007,Marble Retail,Marble Retail,Proposal,185000,110000,2026-05-21,2026-05-21,Priya Shah,2026-03-28,Procurement plan,Best Case,US,Partner,1,
OPP-1008,Vector Labs,Vector Labs,Negotiation,99000,,2026-05-28,2026-05-28,Sam King,2026-04-10,,Commit,DACH,Inbound,2,`;

export const mockRevenueCsv = `Customer,Account Name,CRM Account ID,Billing Account ID,ARR,MRR,ACV,Revenue Status,Contract Start Date,Contract End Date,Renewal Date,Owner,Region,Source System,Subscription Notes
Atlas Foods,Atlas Foods,ACC-1001,BILL-9001,126000,10500,128000,Active,2026-01-01,2026-12-31,2026-11-30,Maya Chen,DACH,Stripe,
Northstar Bio,Northstar Bio,ACC-1002,,0,7600,91000,Active,2026-02-01,2027-01-31,2026-12-31,Eli Brooks,UK,Spreadsheet,Missing billing account
Juniper Works,Juniper Works,,BILL-9003,120000,7000,54000,Active,2026-03-01,2027-02-28,2027-01-31,,US,Stripe,
HelioGrid,HelioGrid,ACC-1004,BILL-9004,-214000,-17833,214000,Cancelled,2026-04-01,2026-03-31,2027-03-01,Noah Reed,DACH,NetSuite,Invalid dates
Cobalt Systems,Cobalt Systems,ACC-1005,BILL-9005,36000,3000,38000,Active,2026-05-01,2027-04-30,2027-03-31,Ava Morgan,France,Stripe,
Summit Logistics,Summit Logistics,ACC-1006,BILL-9006,76000,6100,76000,Active,2026-01-15,2026-12-15,2026-11-15,Luis Ortega,UK,Spreadsheet,
Marble Retail,Marble Retail,ACC-1007,BILL-9007,110000,4500,185000,Active,2026-02-15,2027-02-14,2027-01-14,Priya Shah,US,Stripe,
Vector Labs,Vector Labs,ACC-1008,,99000,8250,99000,Booked,2026-03-20,2027-03-19,2027-02-19,Sam King,DACH,NetSuite,`;
