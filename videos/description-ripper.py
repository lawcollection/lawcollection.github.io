from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.support.ui import WebDriverWait
from bs4 import BeautifulSoup
import urllib.parse
import json

# If set to true, it will re-rip all descriptions,
# otherwise it'll only add ones that are currently empty
destructive = False
data = {}
driver = webdriver.Firefox()

REMOVE_ATTRIBUTES = [
    "class", "dir", "rel", "spellcheck", "target"]

with open("data.json", "r") as f:
    data = json.load(f)

    for i in range(0, len(data["videos"])):


        i = data["videos"][i]

        if destructive or (not destructive and "description" not in i):

            if i["year"] == 2015 or i["year"] > 2019:

                print("loading row " + i["rowNum"])

                # Go to the youtube page
                driver.get("https://www.youtube.com/watch?v="+i["id"])
                # Click Show more
                driver.execute_script("try{document.querySelector('.more-button.style-scope.ytd-video-secondary-info-renderer').click()}catch(TypeError){}")
                # Get description
                outputs_by_css = WebDriverWait(driver, 10).until(
                    lambda driver: driver.find_elements_by_css_selector(".content.style-scope.ytd-video-secondary-info-renderer")
                )

                soup = BeautifulSoup(outputs_by_css[0].get_attribute('innerHTML'), "html.parser")

                for attribute in REMOVE_ATTRIBUTES:
                    for tag in soup.find_all(attrs={attribute: True}):
                        del tag[attribute]

                for a in soup.findAll('a'):

                    qs = urllib.parse.parse_qs(a["href"])

                    if "/redirect?q" in qs:

                        a['href'] = qs["/redirect?q"][0]

                    if "q" in qs:
                        a['href'] = qs["q"][0]

                    if "/watch?v" in qs:
                        a['href'] = "https://youtube.com/watch?v=" + qs["/watch?v"][0]

                if str(soup) == "<!--css-build:shady-->":
                    print("Vid number {} has no YouTube description".format(i["rowNum"]))
                    i["description"] = ""
                    del i["description"]
                    continue

                i["description"] = str(soup)

# Close webdriver
driver.close()

with open("data.json", "w") as json_file:
    json.dump(data, json_file, indent=2)
