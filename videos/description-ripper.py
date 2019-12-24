from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.support.ui import WebDriverWait
import json

data = {}
driver = webdriver.Firefox()

with open("data.json", "r") as f:
    data = json.load(f)

for i in data["videos"]:

    if i["year"] == 2015 or i["year"] == 2019:

        # Go to the youtube page
        driver.get("https://www.youtube.com/watch?v="+i["id"])
        # Get description
        outputs_by_css = WebDriverWait(driver, 10).until(
            lambda driver: driver.find_elements_by_css_selector(".content.style-scope.ytd-video-secondary-info-renderer")
        )
        i["description"] = outputs_by_css[0].text

# Close webdriver
driver.close()

with open("data.json", "w") as json_file:
    json.dump(data, json_file)
