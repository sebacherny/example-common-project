# from linkedin_scraper import Person, actions
# from selenium import webdriver
# driver = webdriver.Chrome()
#
from selenium.webdriver.common.by import By
import time
from selenium import webdriver
import sys
from webdriver_manager.chrome import ChromeDriverManager


def login_to_linkedin(driver, email, password):
    driver.get("https://linkedin.com/uas/login")
    time.sleep(5)
    username = driver.find_element(By.ID, "username")
    username.send_keys(email)  # Enter Your Email Address
    pword = driver.find_element(By.ID, "password")
    pword.send_keys(password)	 # Enter Your Password
    driver.find_element(By.XPATH, "//button[@type='submit']").click()


def get_profiles(driver):
    driver.get('https://www.linkedin.com/mynetwork/invite-connect/connections/')
    previousPageYOffset = 0
    for i in range(30):
        driver.execute_script(
            "window.scrollTo(0, document.body.scrollHeight);")
        pageYOffset = driver.execute_script('return window.pageYOffset;')
        if i > 2 and pageYOffset == previousPageYOffset:
            print("Loaded all profiles")
            break
        time.sleep(1)
        try:
            btn = driver.find_element(
                By.CLASS_NAME, 'scaffold-finite-scroll__load-button')
            btn.click()
        except:
            pass
        time.sleep(2)
    profiles = []
    for profile_div in driver.find_elements(By.CLASS_NAME, 'mn-connection-card__details'):
        for profile_anchor in profile_div.find_elements(By.TAG_NAME, 'a'):
            if '/in/' in profile_anchor.get_attribute('href'):
                profiles.append(profile_anchor.get_attribute('href'))
    return profiles


def get_personal_info(driver):
    main_div = driver.find_element(By.ID, 'main')
    sections = main_div.find_elements(By.TAG_NAME, 'section')
    personal_info_section = sections[0]
    left_panel = personal_info_section.find_element(
        By.CLASS_NAME, 'pv-text-details__left-panel')
    name_surname = left_panel.find_element(By.TAG_NAME, 'h1').text
    presentation_role = left_panel.find_element(
        By.CLASS_NAME, 'text-body-medium').text
    location = None
    for span in personal_info_section.find_elements(By.TAG_NAME, 'span'):
        if 'text-body-small' in span.get_attribute('class') and not 'visually-hidden' in span.get_attribute('class'):
            location = span.text
            break
    person_mail = None
    for possible_mail_link in driver.find_elements(By.TAG_NAME, 'a'):
        if 'mailto' in possible_mail_link.get_attribute('href'):
            person_mail = possible_mail_link.get_attribute(
                'href').split('mailto:')[1]
            break
    return {
        'name': name_surname,
        'role': presentation_role,
        'location': location,
        'mail': person_mail
    }


def get_info_for_profile(driver, profile_url, email, password):
    driver.get(profile_url)
    loops = 1
    while True and loops < 10:
        loops += 1
        time.sleep(3)
        try:
            main_div = driver.find_element(By.ID, 'main')
            break
        except:
            pass
    if loops == 10:
        login_to_linkedin(driver, email, password)
        return get_info_for_profile(driver, profile_url, email, password)
    personal_info = get_personal_info(driver)
    all_info = {}
    sections = main_div.find_elements(By.TAG_NAME, 'section')
    for section in sections:
        try:
            section.find_element(By.ID, 'experience')
            keywords = ['role', 'company', 'timeframe',
                        'place', 'skills', 'description']
            section_id = 'experience'
        except:
            try:
                section.find_element(By.ID, 'education')
                keywords = ['institution', 'degree', 'timeframe']
                section_id = 'education'
            except:
                continue
        all_info[section_id] = []
        for li in section.find_elements(By.TAG_NAME, 'li'):
            if 'artdeco-list__item' not in li.get_attribute('class'):
                continue
            li_info = []
            for span in li.find_elements(By.TAG_NAME, 'span'):
                if span.get_attribute('aria-hidden') == 'true':
                    print(span.text)
                    print('++++++++++++++++++++++')
                    if not span.text in li_info:
                        li_info.append(span.text.strip())
            print('---------' * 10)
            print('---------' * 10)
            job_json = {}
            for i in range(min(len(li_info), len(keywords))):
                job_json[keywords[i]] = li_info[i]
            all_info[section_id].append(job_json)
            print("Information for profile", profile_url)
    print(personal_info)
    print(all_info)
    all_info['personal_info'] = personal_info
    return all_info


def scrap_data(email, password):
    driver = webdriver.Chrome(ChromeDriverManager().install())
    login_to_linkedin(driver, email, password)
    print("Logged in!")
    profiles = get_profiles(driver)
    print("Got {} profiles".format(len(profiles)))
    all_profiles = []
    for profile in profiles:
        print("Scrapping through user", profile)
        profile_info = get_info_for_profile(driver, profile, email, password)
        all_profiles.append(profile_info)
        if len(all_profiles) > 5: # to test
            break
    return all_profiles


if __name__ == '__main__':
    email = sys.argv[1]
    password = sys.argv[2]
    scrap_data(email, password)
