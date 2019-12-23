import json
import csv


input_file = "Website videos.csv"
output_file = "data.json"


# Read CSV File
def read_csv(file, json_file):

    tags = []
    videos = []
    performers = []
    instruments = []
    minYear = 9999
    maxYear = 0
    with open(file) as csvfile:
        reader = csv.DictReader(csvfile)
        title = reader.fieldnames
        for row in reader:

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

        # Remove duplicate tags from global list
        tags = list(dict.fromkeys(tags))
        # Remove duplicate performers from global list
        performers = list(dict.fromkeys(performers))
        # Remove duplicate instruments from global list
        instruments = list(dict.fromkeys(instruments))

        obj = {}
        obj["performers"] = performers
        obj["instruments"] = instruments
        obj["tags"] = tags
        obj["videos"] = videos
        obj["minYear"] = minYear
        obj["maxYear"] = maxYear

        write_json(obj, json_file)


# Convert csv data into json and write it
def write_json(data, json_file):
    with open(json_file, "w") as f:
        f.write(json.dumps(data))


read_csv(input_file, output_file)
