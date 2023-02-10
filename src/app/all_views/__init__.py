import datetime
from app.models import convert_row_to_json


ENVIRONMENTAL = "Environmental"
ENVIRONMENTAL_COLOR = "#3D7345"

SOCIAL = "Social"
SOCIAL_COLOR = "#ffb703"

GOVERNMENT = "Governance"
GOVERNMENT_COLOR = "#3C4770"

DIVERSITY_METRICS = "Diversity Metrics"

UNKNOWN = "Unknown"


class SubCategoryObject():

    def __init__(self, category_id, category_name, abbreviation, esg_category, form_text):
        self.category_id = category_id  # row.ESG_spending_numerical_category
        self.category_name = category_name
        self.abbreviation = abbreviation
        self.esg_category = esg_category
        self.form_text = form_text


ALL_SUBCATEGORIES_LIST = [
    SubCategoryObject(1, 'e-toxic pollution',
                      'toxic pollution', ENVIRONMENTAL,
                      'Reducing pollution associated with operations'),
    SubCategoryObject(2, 'e-packaging material waste',
                      'packaging waste', ENVIRONMENTAL,
                      'Reducing product material waste'),
    SubCategoryObject(3, 'e-clean energy', 'clean energy', ENVIRONMENTAL,
                      'Initiatives that use renewable energy (wind, solar, water)'),
    SubCategoryObject(4, 'e-green building', 'green building', ENVIRONMENTAL,
                      'Investments in buildings that use renewable energy'),
    SubCategoryObject(5, 'e-carbon emissions',
                      'carbon emissions', ENVIRONMENTAL,
                      'Reducing carbon emissions associated with operations'),
    SubCategoryObject(6, 'e-product carbon footprint',
                      'carbon footprint', ENVIRONMENTAL,
                      'Reducing carbon footprint associated with product'),
    SubCategoryObject(7, 'e-environmental restoration efforts',
                      'restoration efforts', ENVIRONMENTAL,
                      'Efforts to protect and restore natural environments/habitats'),
    SubCategoryObject(100, 'e-other', 'e-other', ENVIRONMENTAL, None),

    SubCategoryObject(8, 's-employee health programs',
                      'employee health programs', SOCIAL,
                      'Health programs for employees'),
    SubCategoryObject(9, 's-workplace accidents prevention',
                      'accidents prevention', SOCIAL,
                      'Programs to prevent employe worplace accidents'),
    SubCategoryObject(10, 's-workplace accident care',
                      'accident care', SOCIAL,
                      'Care for employees who have been injured at workplace'),
    SubCategoryObject(11, 's-employee scholarships',
                      'employee scholarships', SOCIAL,
                      'Scholarships for employees'),
    SubCategoryObject(12, 's-employee STEM initiatives',
                      'STEM initiatives', SOCIAL,
                      'STEM education for employees'),
    SubCategoryObject(13, 's-student loan repayment/tuition assistance',
                      'student loan repayment', SOCIAL,
                      'Employee tuition or student loan repayment programs'),
    SubCategoryObject(14, 's-employee continuing education',
                      'employee continuing education', SOCIAL,
                      'Continuing education or training for employees'),
    SubCategoryObject(15, 's-diversity training',
                      'diversity training', SOCIAL,
                      'Diversity and inclusion training for employees'),
    SubCategoryObject(16, 's-representative recruiting',
                      'representative recruiting', SOCIAL,
                      'Initiatives to recruit employees with diverse backgrounds'),
    SubCategoryObject(17, 's-pay equality', 'pay equality', SOCIAL,
                      'Initiatives to achieve pay equality'),
    SubCategoryObject(18, 's-social justice donations/ initiatives',
                      'social justice donations', SOCIAL,
                      'Investment in social movements regarding equal rights & opportunities for individuals'),
    SubCategoryObject(19, 's-community programs for tech',
                      'programs for tech', SOCIAL,
                      'Investment programs to increase technology in communities'),
    SubCategoryObject(20, 's-community programs financial',
                      'programs financial', SOCIAL,
                      'Investment programs to increase financial literacy in communities'),
    SubCategoryObject(21, 's-community programs health',
                      'programs health', SOCIAL,
                      'Investment programs to increase health or healthcare in communities'),
    SubCategoryObject(22, 's-community business programs',
                      'business programs', SOCIAL,
                      'Investment in programs to support small businesses'),
    SubCategoryObject(23, 's-disaster relief', 'disaster relief', SOCIAL,
                      'Investment in disaster (oil spills, wildfires, hurricanes, covid) relief efforts'),
    SubCategoryObject(24, 's-community STEM', 'community STEM', SOCIAL,
                      'Investments in STEM education for communities'),
    SubCategoryObject(25, 's-community scholarships',
                      'community scholarships', SOCIAL,
                      'Scholarships for those within the community'),
    SubCategoryObject(26, 's-community giving OTHER',
                      'community OTHER', SOCIAL,
                      'Spending on community initiatives not listed above'),
    SubCategoryObject(27, 's-foundation giving', 'foundation giving', SOCIAL,
                      'Total amount of corporate foundation giving (if your organization has a foundation)'),
    SubCategoryObject(101, 's-other', 's-other', SOCIAL, None),

    SubCategoryObject(28, 'g-director/csuite pay',
                      'director/csuite pay', GOVERNMENT,
                      'Salary amount of directors or c-suite execs'),
    SubCategoryObject(29, 'g-gender diversity on bod',
                      'gender diversity on board', GOVERNMENT,
                      'Salary of females on board of directors'),
    SubCategoryObject(30, 'g-ethnic diversity on bod',
                      'ethnic diversity on board', GOVERNMENT,
                      'Salary of minorities on board of directors'),
    SubCategoryObject(31, 'g-public policy transparency',
                      'public transparency', GOVERNMENT,
                      'Donation amount to political causes'),
    SubCategoryObject(32, 'g-ethics training', 'ethics training', GOVERNMENT,
                      'Investment in ethics training programs'),
    SubCategoryObject(33, 'g-compliance initiatives',
                      'compliance initiatives', GOVERNMENT,
                      'Investment in legal or industry compliance training'),
    SubCategoryObject(34, 'g-supplier diversity',
                      'supplier diversity', GOVERNMENT,
                      'Investment to increasing supplier diversity'),
    SubCategoryObject(35, 'g-political transparency',
                      'political transparency', GOVERNMENT,
                      'Donations to political candidates'),
    SubCategoryObject(102, 'g-other', 'other', GOVERNMENT, None),

    SubCategoryObject(36, 'dm-Percent of women in the workforce',
                      '% women in workforce', DIVERSITY_METRICS,
                      'Percent of women in the workforce'),
    SubCategoryObject(37, 'dm-Percent of women in management',
                      '% women in management', DIVERSITY_METRICS,
                      'Percent of women in management'),
    SubCategoryObject(38, 'dm-Percent of women in c-suite',
                      '% women in c-suite', DIVERSITY_METRICS,
                      'Percent of women in c-suite'),
    SubCategoryObject(39, 'dm-Percent of women on board of directors',
                      '% women on board', DIVERSITY_METRICS,
                      'Percent of women on board of directors'),
    SubCategoryObject(40, 'dm-Percent of minorities in the workforce',
                      '% minorities in workforce', DIVERSITY_METRICS,
                      'Percent of minorities in the workforce'),
    SubCategoryObject(41, 'dm-Percent of minorities in management',
                      '% minorities in management', DIVERSITY_METRICS,
                      'Percent of minorities in management'),
    SubCategoryObject(42, 'dm-Percent of minorities in c-suite',
                      '% minorities in c-suite', DIVERSITY_METRICS,
                      'Percent of minorities in c-suite'),
    SubCategoryObject(43, 'dm-Percent of minorities on board of directors',
                      '% minorities on board', DIVERSITY_METRICS,
                      'Percent of minorities on board of directors'),
    SubCategoryObject(44, 'dm-Average pay ratio for women to men',
                      'Avg pay ratio for W to M', DIVERSITY_METRICS,
                      'Average pay ratio for women to men'),
    SubCategoryObject(103, 'dm-other', 'other', DIVERSITY_METRICS, None),
]


def get_category_abbreviation_by_number(cat_number):
    ret = [sub for sub in ALL_SUBCATEGORIES_LIST if sub.category_id == cat_number]
    return ret[0].abbreviation.capitalize() if ret else UNKNOWN


class FieldObject():

    def __init__(self, header_in_spreadsheet, row_field_in_database, other_possibilities=None):
        self.header_in_spreadsheet = header_in_spreadsheet
        self.row_field_in_database = row_field_in_database
        self.other_possibilities = other_possibilities


ALL_FIELD_OBJECTS = [
    FieldObject('company ticker', 'company_ticker'),
    FieldObject('year', 'year'),
    FieldObject('company', 'company'),
    FieldObject('cofileinitals', 'cofileinitals'),
    FieldObject('ESG spending numerical category',
                'ESG_spending_numerical_category'),
    FieldObject('csr spending amount(in millions of USD)',
                'csr_spending_amount_millions_USD'),
    FieldObject('csr spending description', 'csr_spending_description'),
    FieldObject('pledge', 'pledge'),
    FieldObject('overmultipleyears', 'overmultipleyears'),
    FieldObject('rationumbersreported', 'rationumbersreported'),
    FieldObject('rationumbersreportedinUS', 'rationumbersreportedinUS'),
    FieldObject('RationumbersreportedGlobal', 'rationumbersreportedGlobal'),
    FieldObject('state', 'state'),
    FieldObject('Number of employees', 'number_of_employees'),
    FieldObject('company revenue', 'company_revenue'),
    FieldObject('Company market value', 'company_market_value'),
    FieldObject('Industry numerical sub-category',
                'industry_numerical_subcategory'),
    FieldObject('Industry sub-category description',
                'industry_subcategory_description'),
    FieldObject('Industry category', 'industry_category'),
    FieldObject('Industry category category description',
                'industry_category_description'),
    FieldObject('ESG spending category', 'ESG_spending_category'),
    FieldObject('ESG spending category description',
                'ESG_spending_category_description'),
    FieldObject('Company region', 'company_region'),
]


class Industry():

    def __init__(self, name, abbreviation=None, synonyms=None):
        self.name = name
        self.abbreviation = abbreviation or name
        self.synonyms = synonyms or tuple()


ALL_INDUSTRIES = [
    Industry('Forestry, & Fishing'),
    Industry('Mining'),
    Industry('Construction'),
    Industry('Manufacturing'),
    Industry('Transportation & Public Utilities', 'Transp. & Public Util.'),
    Industry('Wholesale Trade'),
    Industry('Retail Trade'),
    Industry('Finance, Insurance & Real Estate', 'Fin. Ins. & Real Estate',
             ['Finance Insurance & Real Estate', 'Finance, Insurance, & Real Estate']),
    Industry('Services'),
    Industry('Public Administration'),
]


def get_industry_abbreviation(x):
    for industry in ALL_INDUSTRIES:
        if x.strip() == industry.name or x.strip() in industry.synonyms:
            return industry.abbreviation
    return x


def get_from_row(row, field):
    return convert_row_to_json(row).get(field)


def get_random_color():
    ret = ""
    s = datetime.datetime.now().microsecond
    ret += hex(s*s % 256)[2:]
    s = datetime.datetime.now().microsecond
    ret += hex(s*s % 256)[2:]
    s = datetime.datetime.now().microsecond
    ret += hex(s*s % 256)[2:]
    while len(ret) < 6:
        ret += 'f'
    return '#' + ret.upper()


def get_x_and_y_values_sorted(X, Y):
    x_values_sorted = sorted(
        enumerate(Y), key=lambda pair: pair[1], reverse=True)
    x_values = [X[index_pair[0]] for index_pair in x_values_sorted]
    y_values = [Y[index_pair[0]] for index_pair in x_values_sorted]
    return (x_values, y_values)


def get_custom_donut_graph(rows, category_field, value_to_aggregate_field, title=None,
                           as_percentage=True, should_keep_row_fnc=None,
                           tooltip=None):
    d = {}
    for row in rows:
        if should_keep_row_fnc and not should_keep_row_fnc(row):
            continue
        category = get_from_row(row, category_field)
        val = get_from_row(row, value_to_aggregate_field)
        if not category:
            continue
        if category not in d:
            d[category] = 0
        if isinstance(val, int) or isinstance(val, float):
            d[category] += val
    x_values = sorted(d.keys())
    y_values = [d[key] for key in x_values]
    colors = []
    next_colors = [
        '#FF8B64',
        '#BA68C8',
        '#F06292',
        '#174029',
        '#A68F7B',
        '#A86326',
        '#593622',
        '#8ECAE6',
        '#219EBC',
        '#023047',
        '#3C4770',
        '#447294',
        '#BE8199',
        '#AAB1C3',
        '#DFCFD5',
        '#DE7F5F',
        '#913371',
        '#60375F',
        '#233962',  # Blue, may be similar to others
        '#216594',  # Light blue, may be similar to others
        '#457373',
        '#B4CBD9',
        '#B6F2E1',
        '#BCAFBD',
        '#F0F0F2',
        '#593202',
        '#8C6E37',
        '#739086',
        '#D8D8D6',
        '#F9F9F9',
    ]
    next_idx = 0
    for key in x_values:
        color = None
        if key == ENVIRONMENTAL:
            color = ENVIRONMENTAL_COLOR
        if key == SOCIAL:
            color = SOCIAL_COLOR
        if key == GOVERNMENT:
            color = GOVERNMENT_COLOR
        if color is None:
            if next_idx < len(next_colors):
                color = next_colors[next_idx]
                next_idx += 1
            else:
                color = get_random_color()
        colors.append(color)
    total_y_sum = sum(y_values)
    if as_percentage and total_y_sum != 0:
        y_values = [round(y * 100.0 / total_y_sum, 2) for y in y_values]
    return {'x_values': x_values, 'y_values': y_values,
            'title': title or 'Bar graph seeing sum of {} for each {}'.format(
                value_to_aggregate_field, category_field),
            'colors': colors,
            'total_y_sum': total_y_sum,
            'tooltip': tooltip}


def get_custom_bar_graph(rows, x_field, y_field, custom_title=None, should_keep_row_fnc=None,
                         as_percentage=True, sort_bars=True, keep_first_bars=None,
                         aggregate_function=None, tooltip=None):
    map_of_list = {}
    for row in rows:
        if should_keep_row_fnc and not should_keep_row_fnc(row):
            continue
        key = get_from_row(row, x_field)
        val = get_from_row(row, y_field)
        if not key:
            continue
        if key not in map_of_list:
            map_of_list[key] = []
        if isinstance(val, int) or isinstance(val, float):
            map_of_list[key].append(val)
    d = {}
    for key in map_of_list:
        d[key] = aggregate_function(
            map_of_list[key]) if aggregate_function else sum(map_of_list[key])
    x_values = sorted(d.keys())
    y_values = [d[x] for x in x_values]
    if sort_bars:
        x_values, y_values = get_x_and_y_values_sorted(x_values, y_values)
    if keep_first_bars:
        x_values = x_values[:keep_first_bars]
        y_values = y_values[:keep_first_bars]
    total_y_sum = sum(y_values)
    if as_percentage and total_y_sum != 0:
        y_values = [y * 100.0 / total_y_sum for y in y_values]
    return {'x_values': x_values,
            'y_values': y_values,
            'title': custom_title or 'Graph of {} (y) vs {} (x)'.format(y_field, x_field),
            'total_y_sum': total_y_sum,
            'tooltip': tooltip}


def get_row_error_message(row_obj, row_index):
    msg = None
    if (row_obj.rationumbersreported and row_obj.rationumbersreported > 1) or \
        (row_obj.rationumbersreportedinUS and row_obj.rationumbersreportedinUS > 1) or \
            (row_obj.rationumbersreportedGlobal and row_obj.rationumbersreportedGlobal > 1):
        msg = 'Found ratio {}, it cannot be greater than 1'.format(
            max(row_obj.rationumbersreported,
                row_obj.rationumbersreportedinUS,
                row_obj.rationumbersreportedGlobal
                )
        )
    subcategory_obj = [c for c in ALL_SUBCATEGORIES_LIST
                       if c.category_id == row_obj.ESG_spending_numerical_category]
    if subcategory_obj:
        subcategory_obj = subcategory_obj[0]
        # if subcategory_obj.form_text != row_obj.ESG_spending_category_description:
        #    msg = 'Category is {} and description is "{}", they do not coincide.'.format(
        #        row_obj.ESG_spending_numerical_category,
        #        row_obj.ESG_spending_category_description
        #    )
        if subcategory_obj.esg_category != row_obj.ESG_spending_category:
            if not (row_obj.ESG_spending_category == 'Governanace' and subcategory_obj.esg_category == GOVERNMENT):
                msg = 'ESG Category is "{}" and category id is {}, they do not coincide.'.format(
                    row_obj.ESG_spending_category,
                    row_obj.ESG_spending_numerical_category
                )
    else:
        if row_obj.ESG_spending_numerical_category or row_obj.ESG_spending_category_description or row_obj.ESG_spending_category:
            msg = 'There is a problem with the category information'
    if msg:
        return 'In row {}: {}'.format(row_index + 1, msg)
    else:
        return None


def get_all_subcategories_information():
    d = {}
    for subcategory in ALL_SUBCATEGORIES_LIST:
        if subcategory.form_text is not None:  # None is for invented categories for OTHER
            if subcategory.esg_category not in d:
                d[subcategory.esg_category] = []
            name_to_display = subcategory.category_name
            if name_to_display[1] == '-' or name_to_display[2] == '-':
                name_to_display = name_to_display[name_to_display.index(
                    '-') + 1:]
                name_to_display = name_to_display[0].upper(
                ) + name_to_display[1:]
            d[subcategory.esg_category].append({
                'name': name_to_display,
                'description': subcategory.form_text
            })
    return [{'title': key, 'subcategories': d[key]} for key in d]
