"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

const TVMAZE_API = "http://api.tvmaze.com"
const DEFAULT_IMAGE = "https://static.tvmaze.com/images/no-img/no-img-portrait-text.png";

async function getShowsByTerm(term) {
  let results = await axios.get(`${TVMAZE_API}/search/shows`, { params: {q: term}});
  
  let shows = [];

  for (let entry of results.data) {
    let {id, name, summary, image} = entry.show;
    image = image?.medium || DEFAULT_IMAGE;

    let show = {
      id,
      name, 
      summary, 
      image
    }; 

    shows.push(show);
  }

  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let {id, image, name, summary} of shows) {
    const $show = $(
        `<div data-show-id="${id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${image}" 
              alt="Show Image Here" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${name}</h5>
             <div><small>${summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}


/** Event listener for "Search" button: 
 *    prevents default and submits search term
 */

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  let episodes = [];
  let results = await axios.get(`${TVMAZE_API}/shows/${id}/episodes`);

  for (let {id, name, season, number} of results.data) {
    let episode = {id,
      name,
      season,
      number
    };

    episodes.push(episode);
  }

  return episodes;
}


/** Given array of episodes, writes a list item for each episode 
 *    and appends to episodes list.
 *  Reveals episodes area at bottom of page.
 */

function populateEpisodes(episodes) {
  let $episodesList = $("#episodesList");
  $episodesList.empty();

  for (let {name, season, number} of episodes) {
    let $episode = $(`<li>${name} (season ${season}, number ${number})</li>`);

    $episodesList.append($episode);
  }

  $episodesArea.attr("style", "display: inline-block");
  $episodesArea.show();
}


/** Event listener for "Episodes" button:
 *    prevents default, retrieves and displays episodes list
 */

$("#showsList").on("click", "button", async function (evt) {
  evt.preventDefault();
  await searchForEpisodesAndDisplay(evt);
})


/** Handles "Episodes" button click: gets target show id from DOM,
 *    with id, gets episodes from API and displays
 */

async function searchForEpisodesAndDisplay(evt) {
  const id = $(evt.target.closest("[data-show-id]")).data("show-id");
  const episodes = await getEpisodesOfShow(id);

  populateEpisodes(episodes);
}