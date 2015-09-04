# Udacity Frogger, by Dave Mumford

This is the 3rd project in Udacity's Frontend Web Developer Nanodegree curriculum. The purpose of this
project is to showcase student's Object-Oriented JavaScript and HTML5 Canvas skills and, of course, to
create a game that is playable, bug free and fun!

Play 'Udacity Frogger' online at [http://www.ironwoodlife.com/frogger](http://www.ironwoodlife.com/frogger/).

View the source code by selecting either the 'Clone in Desktop' or 'Download ZIP' options above.

## Game Information
The object of the game is to get as many points as possible! The challenge is avoid the enemies and focus
on completing high point value tasks during the game (see Scoring below).

Each game lasts two minutes and the player has four lives. When the game time has elapsed **or** the player
has used all four lives, the game is over.

The game may be paused and resumed at any time using the spacebar.

### Player Movement
Move the player using the arrow keys: up, down, left, and right.

### Player Change
Change the player by selecting the Ctrl key while hitting the up or down arrow key. This can be done
at any point in the game (even when it's paused) so you can learn the order of the players.

### Defeating Enemies
When the player is hit by an enemy, the player is killed and sent back to home position on the board.
Usually, but not always. Each player has a **_Super Power_** that allows it to defeat one enemy type. Your job
is to figure out which player defeats which enemy.

> Hint: The coloring scheme of a player *may* help you figure out which enemy it can defeat.

> Changing the player on the fly to defeat enemies is the key to this game. Use your knowledge of the
player order and your lightning quick fingers to change the player on the fly and defeat enemies!

### Picking Up After the Enemies
Sometimes the enemies leave a little mess on the road. It is your job to find these 'charms'
and clean them up. You'll need to hurry though. They don't last forever and after a while they
will recycle themselves.

### Scoring
Points are awarded for the following:
* Each full second in play (not in the grass area), 1000 points
* Cleaning up after an Enemy, 5000 points
* Defeating a Enemy - Green, 2000 points
* Defeating a Enemy - Blue, 4000 points
* Defeating a Enemy - Yellow, 6000 points
* Defeating a Enemy - Purple, 8000 points
* Defeating a Enemy - Red, 10000 points

### Help
The Game Rules and Hints are available in-game. The rules are displayed when the game is started
for the first time and whenever the 'Game Info' link is selected. If you want to get a quick review
of the rules *while* you're playing, just pause the game first using the spacebar.

> There are multiple pages of information that can be accessed using the left and right arrow keys.

Enjoy the game and Good Luck!

## Attribution
### Artwork
"Planet Cute" art by Daniel Cook, [LostGarden.com](http://www.lostgarden.com/search?q=Attribution). 

Modified "Planet Cute" art by Cheryl Court, [CherylCourt.ca](http://www.cherylcourt.ca/frogger/attribution.html). 

### Font
[Luckiest Guy](https://www.google.com/fonts/specimen/Luckiest+Guy): Copyright (c) 2010 by Brian J. Bonislawsky DBA Astigmatic (AOETI). All rights reserved.
Available under the [Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0.html).

### Sounds
All sounds obtained from [freesound.org](http://freesound.org).
* Enemy/Player collisions by leviclassen, [hit_002.wav](http://www.freesound.org/people/leviclaassen/sounds/107789/).
* Ladybug Charm drops by yottasounds, [pop.wav](http://www.freesound.org/people/yottasounds/sounds/176727/).
* Ladybug Charm pick-ups by EdgardEdition, [Thud6.wav](https://freesound.org/people/EdgardEdition/sounds/114043/).

## Learning Resources
Object-Oriented JavaScript by [Udacity](https://www.udacity.com/course/object-oriented-javascript--ud015).

HTML5 Canvas by [Udacity](https://www.udacity.com/course/html5-canvas--ud292).

Advanced JS: Games and Visualization by [Khan Academy](https://www.khanacademy.org/computing/computer-programming/programming-games-visualizations).

Stack Exchange [StackOverflow](http://stackoverflow.com/tags/javascript/info)

JavaScript: The Definitive Guide, 6th Edition By [David Flanagan](http://shop.oreilly.com/product/9780596805531.do).
