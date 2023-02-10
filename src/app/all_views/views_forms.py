from rest_framework.decorators import api_view
from django.shortcuts import HttpResponse
from rest_framework import status
import json
import datetime
from django_files.settings import ALL_STATES
from app.all_views import ALL_INDUSTRIES, ALL_SUBCATEGORIES_LIST, \
    ENVIRONMENTAL, SOCIAL, GOVERNMENT, DIVERSITY_METRICS

ALL_COMPANIES_LIST = [
    "3M", "A-Mark Precious Metals", "Abbott Laboratories ", "AbbVie", "ABM Industries", "Academy Sports and Outdoors", "Activision Blizzard", "Adobe", "Advance Auto Parts", "Advanced Micro Devices",
    "AECOM", "AES", "Aflac", "AGCO", "Air Products & Chemicals", "Albertsons", "Alcoa", "Alexion Pharmaceuticals", "Alleghany", "Allstate",
    "Ally Financial", "Alphabet", "Altice USA", "Altria Group", "Amazon", "Ameren", "American Airlines Group", "American Electric Power", "American Express", "American Family Insurance Group",
    "American Financial Group", "American International Group", "American Tower", "Ameriprise Financial", "AmerisourceBergen", "Amgen", "Amphenol", "Analog Devices", "Andersons", "Apple",
    "Applied Materials", "Aramark", "Archer Daniel Midland ", "Arconic", "Arrow Electronics", "Arthur J. Gallagher", "Asbury Automotive Group", "Assurant", "AT&T", "Auto-Owners Insurance",
    "Autoliv", "Automatic Data Processing", "AutoNation", "AutoZone", "Avantor", "Avery Dennison", "Avis Budget Group", "Avnet", "Baker Hughes", "Ball",
    "Bank of America", "Bank of New York Mellon", "Baxter International", "Beacon Roofing Supply", "Becton Dickinson", "Bed Bath & Beyond", "Berkshire Hathaway ", "Berry Global Group", "Best Buy", "Big Lots",
    "Biogen", "BJ's Wholesale Club", "BlackRock", "Blackstone Group", "Boeing", "Boise Cascade", "Booking Holdings", "Booz Allen Hamilton Holding", "BorgWarner", "Boston Scientific",
    "Brighthouse Financial", "Bristol-Myers Squibb", "Broadcom", "Builders FirstSource", "Burlington Stores", "C.H. Robinson Worldwide", "CACI International", "Campbell Soup", "Camping World Holdings", "Capital One Financial",
    "Cardinal Health", "CarMax", "Carrier Global", "Carvana", "Casey's General Stores", "Caterpillar", "CBRE Group", "CDW", "Celanese", "Centene",
    "CenterPoint Energy", "Cerner", "Charles Schwab", "Charter Communications ", "Cheniere Energy", "Chevron", "Chewy", "Chipotle Mexican Grill", "CHS", "Cigna ",
    "Cincinnati Financial", "Cintas", "Cisco Systems", "Citigroup", "Citizens Financial Group", "Clorox", "CMS Energy", "Coca-Cola", "Cognizant Technology Solutions", "Colgate-Palmolive",
    "Comcast", "Commercial Metals", "CommScope Holding", "Community Health Systems", "Conagra Brands", "ConocoPhillips", "Consolidated Edison", "Constellation Brands", "Core-Mark Holding", "Corning",
    "Corteva", "Costco Wholesale", "Coty", "Crown Castle International", "Crown Holdings", "CSX", "Cummins", "CVS Health ", "D.R. Horton", "Dana",
    "Danaher", "Darden Restaurants", "DaVita", "DCP Midstream", "Deere", "Delek US Holdings", "Dell Technologies", "Delta Air Lines", "Dick's Sporting Goods", "Discover Financial Services",
    "Discovery", "DISH Network", "Dollar General", "Dollar Tree", "Dominion Energy", "Dover", "Dow", "DTE Energy", "Duke Energy", "DuPont",
    "DXC Technology", "Eastman Chemical", "eBay", "Ecolab", "Edison International", "Electronic Arts", "Elevance Health", "Eli Lilly", "EMCOR Group", "Emerson Electric",
    "Energy Transfer", "Entergy", "Enterprise Products Partners", "EOG Resources", "Equinix", "Equitable Holdings", "Erie Insurance Group", "Estée Lauder", "Eversource Energy", "Exelon",
    "Expeditors Intl. of Washington", "Exxon Mobil", "Fannie Mae", "Farmers Insurance Exchange", "Fastenal", "FedEx", "Fidelity National Financial", "Fidelity National Information Services", "Fifth Third Bancorp", "First American Financial",
    "FirstEnergy", "Fiserv", "Fluor", "FM Global", "Foot Locker", "Ford Motor", "Fortune Brands Home & Security", "Fox", "Franklin Resources", "Freddie Mac",
    "Freeport-McMoRan", "Frontier Communications", "Gap", "General Dynamics", "General Electric", "General Mills", "General Motors", "Genuine Parts", "Genworth Financial", "Gilead Sciences",
    "Global Partners", "Global Payments", "Goldman Sachs Group", "Goodyear Tire & Rubber", "Graphic Packaging Holding", "Graybar Electric", "Group 1 Automotive", "Guardian Life Ins. Co. of America", "Halliburton", "Hanesbrands",
    "Hartford Financial Services Group", "Hasbro", "HCA Healthcare", "Henry Schein", "Hershey", "Hewlett Packcard Enterprise", "HollyFrontier", "Home Depot", "Honeywell International ", "Hormel Foods",
    "HP", "Humana", "Huntington Ingalls Industries", "Huntsman", "Icahn Enterprises", "Illinois Tool Works", "Ingredion", "Insight Enterprises", "Intel", "Intercontinental Exchange",
    "International Business Machines", "International Paper", "Interpublic Group", "Intuit", "IQVIA Holdings", "J.B. Hunt Transport Services", "J.M. Smucker", "Jabil", "Jacobs Engineering Group", "Jefferies Financial Group",
    "Johnson & Johnson", "Jones Financial (Edward Jones)", "Jones Lang LaSalle", "JPMorgan Chase", "KBR", "Kellogg", "Keurig Dr Pepper", "KeyCorp", "Kimberly-Clark", "Kinder Morgan",
    "KKR", "KLA", "Kohl's", "Kraft Heinz", "Kroger", "L Brands", "L3Harris Technologies", "Laboratory Corp. of America", "Lam Research", "Land O'Lakes",
    "Lear", "Leidos Holdings", "Lennar", "Liberty Media", "Liberty Mutual Insurance Group ", "Lincoln National", "Lithia Motors", "LKQ", "Lockheed Martin", "Loews",
    "Lowe's", "LPL Financial Holdings", "Lumen Technologies", "M&T Bank", "Macy's", "Magellan Health", "ManpowerGroup", "Marathon Petroleum", "Markel", "Marriott International",
    "Marsh & McLennan", "Masco", "Massachusetts Mutual Life Insurance", "MasTec", "Mastercard", "McCormick", "McDonald's", "McKesson", "MDU Resources Group", "Merck",
    "Meta Platforms", "MetLife", "Micron Technology", "Microsoft ", "Mohawk Industries", "Molina Healthcare", "Molson Coors Beverage", "Mondelez International", "Moody's", "Morgan Stanley ",
    "Mosaic", "Motorola Solutions", "Murphy USA", "Mutual of Omaha Insurance", "Nasdaq", "Nationwide", "Navistar International", "NCR", "NetApp", "Netflix",
    "New York Life Insurance", "Newell Brands", "Newmont", "News Corp.", "NextEra Energy", "NGL Energy Partners", "Nike", "Nordstrom", "Norfolk Southern", "Northern Trust",
    "Northrop Grumman", "Northwestern Mutual", "NOV", "NRG Energy", "Nucor", "Nvidia", "NVR", "O-I Glass", "O'Reilly Automotive", "Occidental Petroleum",
    "ODP", "Old Republic International", "Olin", "Omnicom Group", "Oneok", "Oracle", "Oshkosh", "Otis Worldwide", "Ovintiv", "Owens & Minor",
    "Owens Corning", "Paccar", "Pacific Life", "Packaging Corp. of America", "Paramount Global", "Parker-Hannifin", "Patterson", "PayPal Holdings", "PBF Energy", "Penske Automotive Group",
    "PepsiCo", "Performance Food Group", "Peter Kiewit Sons'", "Pfizer", "PG&E", "Philip Morris International", "Phillips 66", "Pioneer Natural Resources", "Plains GP Holdings", "PNC ",
    "Polaris", "Post Holdings", "PPG Industries", "PPL", "Principal Financial", "Procter & Gamble", "Progressive", "Prudential Financial", "Public Service Enterprise Group", "Publix Super Markets",
    "PulteGroup", "PVH", "Qualcomm", "Quanta Services", "Quest Diagnostics", "Qurate Retail", "R.R. Donnelley & Sons", "Ralph Lauren", "Raymond James Financial", "Raytheon Technologies",
    "Realogy Holdings", "Regeneron Pharmaceuticals", "Regions Financial", "Reinsurance Group of America", "Reliance Steel & Aluminum", "Republic Services", "Rite Aid", "Rocket Companies", "Rockwell Automation", "Roper Technologies",
    "Ross Stores", "RPM International", "Ryder System", "S&P Global", "Salesforce", "Sanmina", "Science Applications International", "Seaboard", "Securian Financial Group", "Select Medical Holdings",
    "Sempra Energy", "Sherwin-Williams", "Sinclair Broadcast Group", "Sonic Automotive", "Southern", "Southwest Airlines", "SpartanNash", "Sprouts Farmers Market", "Square (now Block)", "Stanley Black & Decker",
    "Starbucks", "State Farm Insurance", "State Street", "Steel Dynamics", "StoneX Group", "Stryker", "Synchrony Financial", "Sysco", "T. Rowe Price", "Targa Resources",
    "Target", "Taylor Morrison Home", "TD Synnex", "Tenet Healthcare", "Tenneco", "Tesla", "Texas Instruments", "Textron", "Thermo Fisher Scientific ", "Thor Industries",
    "Thrivent Financial for Lutherans", "TIAA", "TJX", "Toll Brothers", "Tractor Supply", "Travelers", "Truist Financial", "Tyson Foods", "U.S Bancorp", "Uber Technologies",
    "UGI", "Ulta Beauty", "Union Pacific", "United Airlines Holdings", "United Natural Foods", "United Parcel Service", "United Rentals", "United States Steel", "UnitedHealth Group ", "Univar Solutions",
    "Universal Health Services", "Unum Group", "US Foods Holding ", "USAA", "Valero Energy", "Veritiv", "Verizon Communications", "Vertex Pharmaceuticals", "VF", "Viatris",
    "Visa", "Vistra", "Voya Financial", "W.R. Berkley", "W.W. Grainger", "Walgreens Boots Alliance", "Walmart", "Walt Disney ", "Waste Management", "Wayfair",
    "WEC Energy Group", "Wells Fargo", "WESCO International", "Western & Southern Financial Group", "Western Digital", "Westinghouse Air Brake Technologies", "Westlake Chemical", "WestRock", "Weyerhaeuser", "Whirlpool",
    "Williams", "Williams-Sonoma", "World Fuel Services", "Xcel Energy", "Xerox Holdings", "XPO Logistics", "Yum Brands", "Yum China Holdings", "Zimmer Biomet Holdings", "Zoetis",

]


@ api_view(['GET'])
def get_form_data(request):
    if request.user.is_anonymous:
        return HttpResponse(json.dumps({"detail": "Not authorized"}), status=status.HTTP_401_UNAUTHORIZED)

    if request.method == "GET":
        this_year = datetime.datetime.now().year
        return HttpResponse(json.dumps({"data": {
            'fiscalYears': [this_year + j for j in range(1, -5, -1)],
            'companyOptions': ALL_COMPANIES_LIST,
            'stateOptions': ALL_STATES,
            'industriesOptions': sorted([industry.name for industry in ALL_INDUSTRIES]),
            'steps': [
                {'name': 'personal_info'},

                {'name': 'select_efforts',
                 'category_name': 'Environment',
                 'efforts': [{'text': subcategory.form_text,
                              'subcategory_num': subcategory.category_id}
                             for subcategory in ALL_SUBCATEGORIES_LIST
                             if subcategory.esg_category == ENVIRONMENTAL and subcategory.form_text]
                 },

                {
                    'name': 'input_csr_values',
                    'category_name': 'Environment'
                },

                {
                    'name': 'select_efforts',
                    'category_name': 'Social',
                    'efforts': [{'text': subcategory.form_text,
                                 'subcategory_num': subcategory.category_id}
                                for subcategory in ALL_SUBCATEGORIES_LIST
                                if subcategory.esg_category == SOCIAL and subcategory.form_text]
                },

                {'name': 'input_csr_values',
                 'category_name': 'Social'},

                {'name': 'select_efforts',
                 'category_name': 'Governance',
                 'efforts': [{'text': subcategory.form_text,
                              'subcategory_num': subcategory.category_id}
                             for subcategory in ALL_SUBCATEGORIES_LIST
                             if subcategory.esg_category == GOVERNMENT and subcategory.form_text]
                 },

                {
                    'name': 'input_csr_values',
                    'category_name': 'Governance'
                },

                {
                    'name': 'select_efforts',
                    'category_name': 'Diversity Metrics',
                    'efforts': [{'text': subcategory.form_text,
                                 'subcategory_num': subcategory.category_id}
                                for subcategory in ALL_SUBCATEGORIES_LIST
                                if subcategory.esg_category == DIVERSITY_METRICS and subcategory.form_text]
                },

                {
                    'name': 'input_csr_values',
                    'category_name': 'Diversity Metrics'
                },

                {
                    'name': 'final_step',
                },
            ],
        }}), status=status.HTTP_200_OK)

    return HttpResponse(json.dumps({"detail": "Wrong method"}), status=status.HTTP_501_NOT_IMPLEMENTED)
