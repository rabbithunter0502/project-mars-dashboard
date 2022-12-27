let store = {
    user: { name: 'Student' },
    apod: null,
    currentRover: null,
    rovers: [],
    isLoading: true
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState);
    render(root, store);
}

const render = (root, state) => {
    root.innerHTML = App(state)
}

// ------------------------------------------------------  API CALLS

// API call
const fetchRovers = () => {
    updateStore(store, {isLoading: true})
    return fetch(`http://localhost:3000/rover`)
        .then(res => res.json())
        .then(result => {
            store.rovers =  result?.rovers;
            store.currentRover =  result?.rovers[0];
            return result?.rovers[0];
        })
        .then(res => fetchRoverData(res))
}

const fetchRoverData = (currentRover) => {
    currentRover = currentRover ? currentRover : store?.currentRover;
    fetch(`http://localhost:3000/rover?roverName=${currentRover?.name}&date=${currentRover?.max_date}`)
        .then(res =>  res.json())
        .then(res => {
            const roverIndex = store.rovers.findIndex(v => v.name === currentRover?.name);
            let updatedStore = Immutable.fromJS(store);
            updatedStore = Immutable.set(updatedStore, 'isLoading', false);
            updatedStore = updatedStore?.setIn(['rovers', roverIndex, 'photos'], res['photos']);
            updatedStore = updatedStore?.setIn(['currentRover', 'photos'], res['photos']);
            updateStore(store, updatedStore.toJS());
        })
}

const onSelectRover = (roverName) => {
    updateStore(store, {isLoading: true})
    const currentRover = store?.rovers.find(r => r?.name === roverName?.id);
    store.currentRover = currentRover;
    fetchRoverData(currentRover);
}
window.onSelectRover = onSelectRover;
// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

const loading = () => {
    return `<img src="assets/images/loading.gif" width="400" style="display:flex; justify-content: center; margin: 10% auto;"/>`;
}

// Generate rover detail
const roverDetail = (rover) => {
    const date = new Date(rover?.photos[0]?.earth_date)
    return `<div class="container">
        <figure class="card">
            <div class="image">
                <img src="${rover?.photos?.[0]?.img_src}" style="width:100%" />
            </div>
            <figcaption>
                <div class="date"><span class="day">${date.getMonth() + 1}</span><span class="month">${date.getFullYear()}</span></div>
                <h3>Rover ${rover?.name}</h3>
                    <ul>
                        <li>Launch Date: ${rover?.launch_date}</li>
                        <li>Lading Date: ${rover?.landing_date}</li>
                        <li>Status: ${rover?.status}</li>
                        <li>Most recently available photos: ${rover?.max_sol}</li>
                        <li>Date the most recent photos were taken: ${rover?.max_date}</li>
                    </ul>
            </figcaption>
        </figure>
    </div>`;
  };



  // Generate rover detail
const roverList = (rovers, currentRover) => {
    return rovers?.map(rover => {
        const className = rover?.name === currentRover?.name ? 'active' : 'inactive';
        return `<a class="${className}" href="#" id="${rover?.name}" onclick="onSelectRover(${rover?.name})">${rover?.name}</a>`
    }).join('')
}

// create content
const App = (state) => {
    let { rovers, user, isLoading, currentRover } = state;
    return isLoading 
    ? loading()
    : `<header>
            <div class="header-left">
                <img src="assets/images/logo.png" width="60" style="margin-rigth: 15px"/>
                <h3>Rovers images diary</h3>
            </div>
            <div class="header-right">
                ${roverList(rovers, currentRover)}
            </div>
        </header>
        <main>
            ${Greeting(user?.name)}
            <section>
                <h3>Introduction</h3>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${roverDetail(currentRover)}
            </section>
        </main>
        <footer>
            <p> Data source from <a href="https://api.nasa.gov/?search=mars#browseAPI">NASA</a></p>
        </footer>`
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', async () => {
    fetchRovers();
})