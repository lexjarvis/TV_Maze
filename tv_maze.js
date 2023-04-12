"use strict";

const MISSING_IMAGE_URL = "https://tinyurl.com/missing-tv";
const TVMAZE_API_URL = "http://api.tvmaze.com/";

const showsList = document.querySelector("#showsList");
const episodesList = document.querySelector("#episodesList");
const episodesArea = document.querySelector("#episodesArea");
const searchForm = document.querySelector("#searchForm");

// Given a search term, search for tv shows that match that query.
// Returns (promise) array of show objects: [show, show, ...].
// Each show object should contain exactly: {id, name, summary, image}
// (if no image URL given by API, put in a default image URL)

async function getShowsByTerm(term) {
    try {
        const response = await axios({
            baseURL: TVMAZE_API_URL,
            url: "search/shows",
            method: "GET",
            params: {
                q: term,
            },
        });
        const shows = response.data.map(result => {
            const show = result.show;
            return {
                id: show.id,
                name: show.name,
                summary: show.summary,
                image: show.image ? show.image.medium : MISSING_IMAGE_URL,
            };
        });

        return shows;
    } catch (error) {
        console.error(error);
    }
}

//  Given list of shows, create markup for each and add to DOM 

function populateShows(shows) {
    showsList.innerHTML = "";

    for (let show of shows) {
        const showDiv = document.createElement("div");
        showDiv.setAttribute("data-show-id", show.id);
        showDiv.classList.add("Show", "col-md-12", "col-lg-6", "mb-4");
        const mediaDiv = document.createElement("div");
        mediaDiv.classList.add("media");
        showDiv.appendChild(mediaDiv);

        const image = document.createElement("img");
        image.setAttribute("src", show.image);
        image.setAttribute("alt", show.name);
        image.classList.add("w-25", "me-3");
        mediaDiv.appendChild(image);

        const mediaBodyDiv = document.createElement("div");
        mediaBodyDiv.classList.add("media-body");
        mediaDiv.appendChild(mediaBodyDiv);

        const name = document.createElement("h5");
        name.classList.add("text-primary");
        name.textContent = show.name;
        mediaBodyDiv.appendChild(name);

        const summary = document.createElement("div");
        summary.innerHTML = `<small>${show.summary}</small>`;
        mediaBodyDiv.appendChild(summary);

        const button = document.createElement("button");
        button.classList.add("btn", "btn-outline-light", "btn-sm", "Show-getEpisodes");
        button.textContent = "Episodes";
        mediaBodyDiv.appendChild(button);

        showsList.appendChild(showDiv);
    }
}

// Handle search form submission: get shows from API and display. Hide episodes area (that only gets shown if they ask for episodes)

async function searchForShowAndDisplay() {
    const term = document.querySelector("#searchForm-term").value;
    const shows = await getShowsByTerm(term);

    episodesArea.style.display = "none";
    populateShows(shows);
}

searchForm.addEventListener("submit", async function (evt) {
    evt.preventDefault();
    await searchForShowAndDisplay();
});

// Given a show ID, get from API and return (promise) array of episodes { id, name, season, number }

async function getEpisodesOfShow(id) {
    const response = await axios({
        baseURL: TVMAZE_API_URL,
        url: `shows/${id}/episodes`,
        method: "GET",
    });

    return response.data.map(e => ({
        id: e.id,
        name: e.name,
        season: e.season,
        number: e.number,
    }));
}


//  Given list of episodes, create markup for each and to DOM

function populateEpisodes(episodes) {
    $episodesList.empty();

    for (let episode of episodes) {
        const $item = $(
            `<li>
           ${episode.name}
           (season ${episode.season}, episode ${episode.number})
         </li>
        `);

        $episodesList.append($item);
    }

    $episodesArea.show();
}


// Handle click on episodes button: get episodes for show and display

async function getEpisodesAndDisplay(evt) {
    const showId = $(evt.target).closest(".Show").data("show-id");
    const episodes = await getEpisodesOfShow(showId);
    populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);