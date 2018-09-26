// Execute the following once the extension button has been pressed.
chrome.browserAction.onClicked.addListener(function(tab) {
    /*
     * Inject the following script into the current tab.
     * The script will extract the HTML source of the current tab.
     */
    chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
    }, function() {
        if (chrome.runtime.lastError) {
            // Log encountered errors to console.
            console.log('There was an error injecting script : \n' + chrome.runtime.lastError.message);
        }
    });
});

// Once the HTML source has been extracted from the current tab, pass it to `createPptx()`.
chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
        createPptx(request.source);
    }
});

// Create Powerpoint from HTML source.
function createPptx(source) {
    // Extract songs lyrics and details about the song and create a `Song` object using them.
    var song = extractSong(source);
    // Create an array to store the lyrics to display on each slide within the PowerPoint.
    var slides = new Array();
    
    // For each section of lyrics, divide the lyrics up into sections of text to be placed into slides.
    song.lyrics.sections.forEach(function(section) {

        /*
         * If a certain section contains a line or two that is repeated multiple times,
         * use the shorthand `line-text (xN)` where N is the number of times `line-text` occurs.
         */
        if (section.allEqual() && section.lines.length > 1)
        {
            slides.push(section.lines[0] + " (x" + section.lines.length + ")");
            return;
        } else if (section.everyOtherLineEqual() && section.lines.length > 2 && section.lines.length % 2 == 0)
        {
            slides.push(section.lines[0] + "\n" + section.lines[1] + " (x" + (section.lines.length/2) + ")");
            return;
        }

        // Determine the best number of lines to be placed on each slide.
        if (section.lineCountMod3 == 0) {
            section.divisionSize = 3;
        } else if (section.lineCountMod4 == 0) {
            section.divisionSize = 4;
        } else {
            if (section.lineCountMod3 > section.lineCountMod4) {
                section.divisionSize = 3;
            } else {
                section.divisionSize = 4;
            }
        }

        // Divide the sections up by the previously specified lineCounts and place them on slides accordingly.
        for (var i = 0, j = section.lineCount; i < j; i += section.divisionSize) {
            slides.push(section.lines.slice(i, i + section.divisionSize).join('\n'));
        }
    });

    // Create new Powerpoint.
    var pptx = new PptxGenJS();

    // Create title slide for Powerpoint containing title and author of song.
    var slide = pptx.addNewSlide();
    slide.addText(
        [
            { text:song.title, options:{fontSize:40} },
            { text:song.author, options:{fontSize:28} },
        ],
        { x:'5%', y:'25%', w:'90%', h:'50%', align:'center', color:'363636' });

    // For each slide text division create a slide in Powerpoint and populate the slide with the provided text.
    slides.forEach(function(slideText) {
        slide = pptx.addNewSlide();
        slide.addText(slideText, { x:'5%', y:'25%', w:'90%', h:'50%', fontSize:32, align:'center', color:'363636' });
    });

    // Save the Powerpoint.
    pptx.save(song.title + " - " + song.author);
}