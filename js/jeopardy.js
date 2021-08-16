'use strict';
const NUM_CATEGORIES = 6;
const NUM_CLUES_PER_CAT = 5;

/* categories:
  [
    { title: "Math",
      clues: [
        {question: "2+2", answer: "4", showing: null},
        {question: "1+1", answer: "2", showing: null}, ... 3 more clues ...
      ],
    },
    { title: "Literature",
      clues: [
        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
        {question: "Bell Jar Author", answer: "Plath", showing: null}, ...
      ],
    }, ...4 more categories ...
  ]
*/

let categories = [];


/** Get NUM_CATEGORIES random categories from API.
 *
 * Returns array of category ids, e.g. [4, 12, 5, 9, 20, 1]
 * getCategoryIds makes a get request to /categories to get 100 categories. These categories are then shuffled
 * and the first 6 shuffled categories are returned in an array.
 */

async function getCategoryIds() {
    let LotsOfIds = [];
    const categories = await Api.get("categories", { count: 100 })
    for (let cat of categories) {
        LotsOfIds.push(cat.id);
    }

    let gameIds = [];
    let shuffledIds = shuffle(LotsOfIds);
    for (let i = 0; i < NUM_CATEGORIES; i++) {
        gameIds.push(shuffledIds[i]);
    }
    return gameIds;
}

/*shuffles the random the list of ids from API and returns an array of the Ids shuffled */
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        // swaps the value
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


/* getCategory takes in a category ID and makes a get request to /clues. 
 Takes data from request and returns an object with title of category and an array of 5 clues
 return value Ex:  { title: "Math",
      clues: [
        {question: "2+2", answer: "4", showing: null},
        {question: "1+1", answer: "2", showing: null}, ... 3 more clues ...
     ],
   }
*/
async function getCategory(catId) {
    const response = await Api.get("clues", { category: catId });
    console.log("response", response);
    let title = response[0].category.title;
    console.log('title', title);
    let clues = [];

    for (let currentClue of response) {
        const question = currentClue.question;
        const answer = currentClue.answer;
        const showing = null;
        clues.push({ question, answer, showing });
    }

    return { title, clues };

}

// calls getCategoryIDs to get random IDs and getCategory to populate the global categories array
async function fillCategoryData() {
    let catIds = await getCategoryIds();
    console.log("catIds", catIds);

    for (let id of catIds) {
        let catData = await getCategory(id);
        categories.push(catData);
    }
    return categories;
}

// Appends table element and tablehead and tablebody to game container 
// adds classes that will be used in fillTable() 
function appendTableHTML() {
    $('#game-container')
        .html('<table id="game-table" class="table game-table"><thead id="table-head"></thead ><tbody id="table-body" class="table-body"></tbody>');
}


// fillTable calls AppendTableHTML to get base HTML elements to the game container
// adds a row of categories using the global categories array
// adds the tds to the table body and documents what clue should go in each td using data-
async function fillTable() {
    appendTableHTML();

    let $tableHead = $('#table-head');
    let $tableBody = $('#table-body');

    let row = document.createElement('tr');
    let $row = $(row);
    $tableHead.append($row);

    // adds the category row and each category title
    for (let i = 0; i < NUM_CATEGORIES; i++) {
        let $td = $('<td>');
        $td.text(categories[i].title.toUpperCase());
        $td.attr('class', 'category-row');
        $row.append($td);
    }
    // loops and adds tds to the table. adds showing class as well as data-coordinates of 
    // what clue should go on that td. These coordinates will be used to show on click.
    for (let y = 0; y < NUM_CLUES_PER_CAT; y++) {
        let newRow = document.createElement('tr');
        let $newRow = $(newRow);
        for (let x = 0; x < NUM_CATEGORIES; x++) {
            let $td = $('<td>');
            $td.text('?');
            $td.attr('class', 'showing-null').addClass('valid');
            $td.attr('data-coordinates', `${x}-${y}`);
            $newRow.append($td);
        }
        $tableBody.append($newRow);
    }

}

/* Handle clicking on a clue: show the question or answer.
   handleClick() looks at the class of the td and if has a class of showing-null it shows the question
   if has class of question it shows the answer
   uses the data-coordinates to locate the correct clue from the global categories array.
*/
function handleClick(evt) {
    console.log('handleClick ', evt.target);
    evt.preventDefault();
    let $target = $(evt.target);
    let k = Number($target.attr('data-coordinates')[0]);
    let j = Number($target.attr('data-coordinates')[2]);


    if ($target.hasClass('showing-null')) {
        $target.html(categories[k].clues[j].question);
        $target.removeClass('showing-null').addClass('question');
    } else if ($target.hasClass('question')) {
        $target.removeClass('question').addClass('answer');
        $target.html(categories[k].clues[j].answer);
    }

}


// showLoadingView() wipes the jeopardy board and appens a spinner font. Changes start button to Loading...
function showLoadingView() {
    $('#game-container').empty().append(' <i class="fas fa-spinner fa-pulse"></i>');
    $('#start-game-button').text('Loading...');

}

// hideLoadingView() Removes the loading spinner and updates the button used to fetch data.
function hideLoadingView() {
    $('#game-container').empty();
    $('#start-game-button').text('Start Game');
}




// Setup game data and board:
// calls fillCategoryData() which updates the global categories array with random categories and clues
// associated with each category.
// Calls fillTable() to populate HTML table
async function setupGameBoard() {
    categories = [];
    await fillCategoryData();
    await fillTable();
}

/** Start game: show loading state, setup game board, stop loading state */
async function setupAndStart() {
    showLoadingView();
    setTimeout(hideLoadingView, 500);
    await setupGameBoard();


}
// click event for the start game button
$('#start-game-button').on('click', setupAndStart);
// click event for clicking on the game board
$('#game-container').on('click', '.valid', handleClick);