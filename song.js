function Song(author, title, lyrics) {
    this.author = author;
    this.title = title;
    this.lyrics = new Lyrics(lyrics);

}

function Lyrics(text) {
    this.all = text;
    this.sections = createSections(text.replace(/<br>/g, "").split("\n\n"));
}

function createSections(text)
{
    var sections = Array();
    text.forEach(function(textDivision) {
        sections.push(new Section(textDivision));
    });
    return sections;
}

function Section(text)
{
    this.text = text;
    this.lines = text.split(/\r\n|\r|\n/);
    this.lineCount = this.lines.length;
    this.lineCountMod3 = this.lineCount % 3;
    this.lineCountMod4 = this.lineCount % 4;
    this.divisionSize;
    
    this.allEqual = function() {
        var returnVal = true;
        for (var i = 1; i < this.lines.length; i++) {
            if (this.lines[i].valueOf() !== this.lines[0].valueOf()) {
                returnVal = false;
            }
        }
        return returnVal;
    }

    this.everyOtherLineEqual = function() {
        var returnVal = true;
        for (var i = 2; i < this.lines.length; i++) {
            if(this.lines[i].valueOf() !== this.lines[i%2].valueOf()) {
                returnVal = false;
            }
        }
        return returnVal;
    }
}

function extractSong(source)
{
    var myRe = /ArtistName = "(.+?)";(?:.|\n)+?SongName = "(.+?)";(?:.|\n)+?<div>(?:.|\n)+?<!-- Usage of azlyrics\.com(?:.|\n)+?-->((?:.|\n)+?)<\/div>/;
    var songInfo = myRe.exec(source);

    for (var i = 0; i < songInfo.length; i++) {
        songInfo[i] = escapeHtml(songInfo[i]);
    }
    console.log(songInfo);
    var song = new Song(songInfo[1], songInfo[2], songInfo[3]);
    return song;
}

function escapeHtml(text) {
  return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
      .replace(/&#039;/g, "'");
}