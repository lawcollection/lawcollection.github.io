/* global noUiSlider wNumb */
var jsonData;
var defaultVid = "68C1X1wEAZc";
var videos = {};
const sites = new XMLHttpRequest();
var activeTags = [];
var activePlayers = [];
var activeInstruments = [];
var slider;
var minYear;
var maxYear;

// General functions

function removeFrmArr (array, element) {
	return array.filter(e => e !== element);
}

// https://gist.github.com/iwek/3924925#file-find-in-json-js
//return an array of objects according to key, value, or key and value matching
function getObjects (obj, key, val) {
	var objects = [];
	for (var i in obj) {
		if (!obj.hasOwnProperty(i)) continue;
		if (typeof obj[i] == "object") {
			objects = objects.concat(getObjects(obj[i], key, val));
		} else
		//if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
		if (i == key && obj[i] == val || i == key && val == "") { //
			objects.push(obj);
		} else if (obj[i] == val && key == ""){
			//only add if the object is not already in the array
			if (objects.lastIndexOf(obj) == -1){
				objects.push(obj);
			}
		}
	}
	return objects;
}

//return an array of values that match on a certain key
function getValues (obj, key) {
	var objects = [];
	for (var i in obj) {
		if (!obj.hasOwnProperty(i)) continue;
		if (typeof obj[i] == "object") {
			objects = objects.concat(getValues(obj[i], key));
		} else if (i == key) {
			objects.push(obj[i]);
		}
	}
	return objects;
}

//return an array of keys that match on a certain value
function getKeys (obj, val) {
	var objects = [];
	for (var i in obj) {
		if (!obj.hasOwnProperty(i)) continue;
		if (typeof obj[i] == "object") {
			objects = objects.concat(getKeys(obj[i], val));
		} else if (obj[i] == val) {
			objects.push(i);
		}
	}
	return objects;
}

function getQueryStrings () {
	const assoc = {};
	const decode = function (s) {
		return decodeURIComponent(s.replace(/\+/g, " "));
	};
	const queryString = location.search.substring(1);
	const keyValues = queryString.split("&");

	keyValues.forEach(product => {
		const key = product.split("=");
		if (key.length > 1) {
			assoc[decode(key[0])] = decode(key[1]);
		}
	});

	return assoc;
}
const qs = getQueryStrings();



// Specialised funtions
function setBig (video, play) {

	document.getElementById("songTitle").innerText = video.title;

	if (video.composer.length !== 0) {
		document.getElementById("songArtist").innerText = `Composed by ${video.composer.join(", ")}`;
	} else {
		document.getElementById("songArtist").innerText = "";
	}
	document.getElementById("performer").innerText = video.attribution;

	if (play){
		document.getElementById("big").src = `https://www.youtube.com/embed/${video.id}?&theme=dark&color=white&autohide=2&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3"frameborder="0"&autoplay=1`;

		window.scroll({
			top: 0,
			left: 0,
			behavior: "smooth"
		});

	} else {
		document.getElementById("big").src = `https://www.youtube.com/embed/${video.id}?&theme=dark&color=white&autohide=2&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3"frameborder="0"`;
	}

	// Set description
	if (video.description !== undefined) {
		document.getElementById("description").innerHTML = video.description;
	} else {
		document.getElementById("description").innerHTML = "";
	}

	document.getElementById("year").innerText = video.year;
}

// eslint-disable-next-line no-unused-vars
function changeVideo (clicked) {
	console.log(getObjects(videos, "id", clicked.id));
	setBig(getObjects(videos, "id", clicked.id)[0], true);
}

/**
 * @param  {} toDraw
 */
function drawVideos (toDraw) {

	// Clear current videos
	while (document.getElementById("container").hasChildNodes()) {
		document.getElementById("container").removeChild(document.getElementById("container").lastChild);
	}

	const container = document.querySelector("#container");
	let parentCount = 0;

	for (let i = 0; i < Object.keys(toDraw).length; i++) {

		const video = Object.keys(toDraw)[i];


		// If we've had more than 4 videos
		if (i % 4 === 0) {
			// Make a new parent
			const parentClone = document.querySelector("#parentTemplate").cloneNode(true);
			parentCount += 1;
			parentClone.setAttribute("id", `parentNo${parentCount}`);
			container.appendChild(parentClone);
		}

		// Copy template
		const clone = document.querySelector("#template").cloneNode(true);

		// Change the id attribute of the newly created element:
		clone.setAttribute("id", toDraw[video].id);

		//Background to thumbnail
		clone.style.backgroundImage = "url('http://img.youtube.com/vi/" + toDraw[video].id + "/hqdefault.jpg')";

		// Set tile
		// clone.innerText = toDraw[video].title + toDraw[video].year
		// clone.childNodes[5].childNodes[1].textContent = toDraw[video].title;
		clone.childNodes[7].textContent = toDraw[video].title;
		// clone.childNodes[5].childNodes[3].textContent = toDraw[video].year;
		clone.childNodes[9].textContent = toDraw[video].year;


		// // Append the newly created element on element p
		document.getElementById(`parentNo${parentCount}`).appendChild(clone);

	}
}


sites.onload = function () {

	jsonData = JSON.parse(sites.response);
	videos = jsonData["videos"];
	minYear = jsonData["minYear"];
	maxYear = jsonData["maxYear"];


	// Generate tag list
	for (var tag in jsonData["tags"]) {


		tag = jsonData["tags"][tag];

		const newTag = document.createElement("span");
		newTag.setAttribute("class", "tag");

		newTag.innerHTML = tag;
		// Set tag id to not use spaces and be in lowercase
		newTag.id = tag.replace(" ", "-").toLowerCase();


		if (newTag.addEventListener)
			newTag.addEventListener("click", toggleTag, false); //everything else
		else if (newTag.attachEvent)
			newTag.attachEvent("onclick", toggleTag);  //IE only

		newTag.onclick = "toggleTag()";

		document.getElementById("taglist").appendChild(newTag);
	}

	// Generate player list
	for (var player in jsonData["performers"]) {

		player = jsonData["performers"][player];

		const newPlayer = document.createElement("span");
		newPlayer.setAttribute("class", "tag");

		newPlayer.innerHTML = player;
		// Set tag id to not use spaces and be in lowercase
		newPlayer.id = player.replace(" ", "-").toLowerCase();


		if (newPlayer.addEventListener)
			newPlayer.addEventListener("click", togglePlayer, false); //everything else
		else if (newPlayer.attachEvent)
			newPlayer.attachEvent("onclick", togglePlayer);  //IE only

		newPlayer.onclick = "togglePlayer()";

		document.getElementById("player").appendChild(newPlayer);
	}

	// Generate instrument list
	for (var instrument in jsonData["instruments"]) {

		instrument = jsonData["instruments"][instrument];

		const newPlayer = document.createElement("span");
		newPlayer.setAttribute("class", "tag");

		newPlayer.innerHTML = instrument;
		// Set tag id to not use spaces and be in lowercase
		newPlayer.id = instrument.replace(" ", "-").toLowerCase();


		if (newPlayer.addEventListener)
			newPlayer.addEventListener("click", toggleInstrument, false); //everything else
		else if (newPlayer.attachEvent)
			newPlayer.attachEvent("onclick", toggleInstrument);  //IE only

		newPlayer.onclick = "toggleInstrument()";

		document.getElementById("instruments").appendChild(newPlayer);
	}

	// Draw all videos
	drawVideos(videos);

	// Setup years slider
	slider = document.getElementById("yearsSlider");

	noUiSlider.create(slider, {
		start: [minYear, maxYear],
		step: 1,
		range: {
			"min": [minYear],
			"max": [maxYear]
		},
		tooltips: true,
		connect: true,
		pips: {
			mode: "values",
			density: 10,
			values: [minYear, (maxYear - minYear) / 2 + minYear, maxYear],
		},
		format: wNumb({decimals: 0})
	});

	slider.noUiSlider.on("change", search);

	// If we've chosen a certain video to play
	if (qs.v) {

		// And it's a valid video
		if (getObjects(videos, "id", qs.v)[0] !== undefined) {
			setBig(getObjects(videos, "id", qs.v)[0]);
		} else {
			setBig(getObjects(videos, "id", defaultVid)[0]);
		}

	// Otherwise
	} else {

		// Play the default video
		setBig(getObjects(videos, "id", defaultVid)[0]);
	}

};

function toggleTag (passed) {

	// If the tag's already on
	if (passed.target.getAttribute("on") === ""){

		// Remove on state
		passed.target.removeAttribute("on");

		passed.target.children[0].remove();

		// Remove from active tags
		activeTags = removeFrmArr(activeTags, passed.target.innerText);

	} else {
		passed.target.setAttribute("on", "");

		const button = document.createElement("button");
		button.classList.add("delete", "is-small", "x");

		passed.target.appendChild(button);

		activeTags.push(passed.target.innerText);
	}

	search();

}

function togglePlayer (passed) {

	// If the tag's already on
	if (passed.target.getAttribute("on") === ""){

		// Remove on state
		passed.target.removeAttribute("on");

		passed.target.children[0].remove();

		// Remove from active tags
		activePlayers = removeFrmArr(activePlayers, passed.target.innerText);

	} else {
		passed.target.setAttribute("on", "");

		const button = document.createElement("button");
		button.classList.add("delete", "is-small", "x");

		passed.target.appendChild(button);

		activePlayers.push(passed.target.innerText);
	}

	search();

}

function toggleInstrument (passed) {

	// If the tag's already on
	if (passed.target.getAttribute("on") === ""){

		// Remove on state
		passed.target.removeAttribute("on");

		passed.target.children[0].remove();

		// Remove from active tags
		activeInstruments = removeFrmArr(activeInstruments, passed.target.innerText);

	} else {
		passed.target.setAttribute("on", "");

		const button = document.createElement("button");
		button.classList.add("delete", "is-small", "x");

		passed.target.appendChild(button);

		activeInstruments.push(passed.target.innerText);
	}

	search();

}

function search () {

	const results = [];
	const query = document.getElementById("search").value.toLowerCase();

	for (var video in videos) {

		let tagPass = false;
		// let yearPass = true;
		let playerPass = false;
		let instrumentPass = false;
		let searchPass = false;


		// If there are any active tags
		if (activeTags.length > 0) {
			for (var tag in videos[video].tags) {

				// If the video contains an active tag
				if (activeTags.includes(videos[video].tags[tag])) {
					tagPass = true;
				}
			}
		}
		// If there are no active tags
		else {
			tagPass = true;
		}


		// If there are any active players
		if (activePlayers.length > 0) {
			for (var player in videos[video].performers) {

				// If the video contains an active player
				if (activePlayers.includes(videos[video].performers[player])) {
					playerPass = true;
				}
			}
		}
		// If there are no active players
		else {
			playerPass = true;
		}

		// If there are any active instruments
		if (activeInstruments.length > 0) {
			for (var instrument in videos[video].instruments) {

				// If the video contains an active player
				if (activeInstruments.includes(videos[video].instruments[instrument])) {
					instrumentPass = true;
				}
			}
		}
		// If there are no active players
		else {
			instrumentPass = true;
		}


		// Year range
		const range = slider.noUiSlider.get();

		// Less than min or more than max
		if (range[0] > videos[video].year || videos[video].year > range[1] ) {
			// yearPass = false;
			continue;
			// break;
		}


		if (query === "") {
			searchPass = true;
		} else {

			const parts = [
				videos[video].title,
				videos[video].composer,
				videos[video].performers,
				videos[video].year,
				videos[video].instruments,
				videos[video].tags,
				videos[video].id
			];

			for (let part in parts) {
				console.log(parts[part]);

				if (typeof parts[part] === "undefined") {break;}
				else if (typeof parts[part] === "object"){

					for (let partpart in part) {

						if (typeof parts[part][partpart] === "undefined") {break;}

						partpart = parts[part][partpart].toLowerCase();

						if (partpart.includes(query)){
							searchPass = true;
						}

					}

				} else if (typeof parts[part] === "number") {
					part = parts[part].toString();
				} else {
					part = parts[part].toLowerCase();
				}
				console.log(part, query);
				if (part.includes(query)) {
					searchPass = true;
				}

			}

		}



		// Passes all criteria
		if (tagPass && playerPass && instrumentPass && searchPass) {
			results.push(videos[video]);
		}
	}


	drawVideos(results);
}

window.onload = function (){
	sites.open("get", "videos/data.json", true);
	sites.send();

	var button = document.getElementById("searchButton");
	if (button.addEventListener)
		button.addEventListener("click", search, false); //everything else
	else if (button.attachEvent)
		button.attachEvent("onclick", search);  //IE only


	document.getElementById("search").addEventListener("keydown", function (e) {
		// eslint-disable-next-line no-redeclare
		if (!e) { var e = window.event; }

		// Enter is pressed
		if (e.keyCode == 13) { document.getElementById("searchButton").click(); }
	}, false);

	// Get all "navbar-burger" elements
	const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll(".navbar-burger"), 0);

	// Check if there are any navbar burgers
	if ($navbarBurgers.length > 0) {

		// Add a click event on each of them
		$navbarBurgers.forEach( el => {
			el.addEventListener("click", () => {

				// Get the target from the "data-target" attribute
				const target = el.dataset.target;
				const $target = document.getElementById(target);

				// Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
				el.classList.toggle("is-active");
				$target.classList.toggle("is-active");

			});
		});
	}

};
