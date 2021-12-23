import json
import csv
import requests


# Download csv from secret google sheets link
url = ""
with open("sheets_url.txt") as fileUrl:
    url = fileUrl.read()

response = requests.get(url)
assert response.status_code == 200, 'Wrong status code'

with open("downloaded.csv", "w", encoding="utf-8") as csvFile:
    csvFile.write(response.content.decode())


input_file = "downloaded.csv"
output_file = "data.json"
currentData = {}
destructive = False

try:
    with open("data.json", "r", encoding="utf-8") as f:
        currentData = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    destructive = True
    pass


def dictByKey(json_object, value):
    return [obj for obj in json_object if obj["rowNum"] == value]


# Read CSV File
def read_csv(file, json_file):

    tags = []
    videos = []
    performers = []
    instruments = []
    minYear = 2004
    maxYear = 2020
    with open(file, encoding="utf8") as csvfile:
        reader = csv.DictReader(csvfile)

        # title = reader.fieldnames
        for row in reader:

            if destructive or ((not destructive) and (not dictByKey(currentData["videos"], row["#"]))):
                # If the row's not empty and has a youtube URL
                if bool(row["Title"] and row["YouTube url"]):

                    videosObj = {}
                    videosObj["rowNum"] = row["#"]
                    videosObj["title"] = row["Title"]
                    videosObj["attribution"] = row["Attribution"]

                    videosObj["composer"] = list(
                        map(str.strip, filter(None, row["Composer"].split(","))))

                    videosObj["performers"] = []
                    for p in list(map(str.strip, filter(
                            None, row["Performed by"].split(",")))):

                        if p == "A":
                            p = "Allie"
                        elif p == "M":
                            p = "Matthew"
                        videosObj["performers"].append(p)

                    videosObj["year"] = int(row["Year"])

                    if videosObj["year"] < minYear:
                        minYear = videosObj["year"]

                    elif videosObj["year"] > maxYear:
                        maxYear = videosObj["year"]

                    videosObj["instruments"] = list(
                        map(str.strip, filter(None, row["Instrument"].split(","))))

                    videosObj["tags"] = list(
                        map(str.strip, filter(None, row["Tagz"].split(","))))

                    # Get just the id, no trailing stuff or url
                    videosObj["id"] = row["YouTube url"].split("/")[-1][0:11]

                    # Add to overall list of tags
                    tags += list(map(str.strip, filter(None, row["Tagz"].split(","))))
                    performers += videosObj["performers"]
                    instruments += videosObj["instruments"]

                    videos.append(videosObj)
            print(len(videos))
            # Remove duplicate tags from global list
            tags = list(dict.fromkeys(tags))
            # Remove duplicate performers from global list
            performers = list(dict.fromkeys(performers))
            # Remove duplicate instruments from global list
            instruments = list(dict.fromkeys(instruments))

        if destructive:
            obj = currentData
            obj["performers"] = performers
            obj["instruments"] = instruments
            obj["tags"] = tags
            obj["videos"] = videos
            obj["minYear"] = minYear
            obj["maxYear"] = maxYear

        else:
            obj = currentData
            obj["performers"].extend(x for x in performers if x not in obj["performers"])
            obj["instruments"].extend(x for x in instruments if x not in obj["instruments"])
            obj["tags"].extend(x for x in tags if x not in obj["tags"])
            obj["videos"].extend(x for x in videos if x not in obj["videos"])
            obj["minYear"] = currentData["minYear"]
            obj["maxYear"] = currentData["maxYear"]

        # Sort videos by row num
        def extract_row(json):
            try:
                # Also convert to int since update_time will be string.  When comparing
                # strings, "10" is smaller than "2".
                return int(json['rowNum'])
            except KeyError:
                return 0

        # lines.sort() is more efficient than lines = lines.sorted()
        obj["videos"].sort(key=extract_row, reverse=True)

        write_json(obj, json_file)


# Convert csv data into json and write it
def write_json(data, json_file):
    with open(json_file, "w") as f:
        f.write(json.dumps(data, indent=2))


read_csv(input_file, output_file)
