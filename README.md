# Udacity Frogger, by Dave Mumford

This is the 3rd project in Udacity's Frontend Web Developer Nanodegree curriculum. The purpose of this
project is to showcase student's Object-Oriented JavaScript and HTML5 Canvas skills and, of course, to
create a game that is playable, bug free and fun!

You may play 'Udacity Frogger' online at [http://www.ironwoodlife.com/frogger](http://www.ironwoodlife.com/frogger/).

To view the source code select either the 'Clone in Desktop' or 'Download ZIP' options above.

## Game Information
The object of the game is to get as many points as possible! The challenge is avoid the enemies and focus
on the high point value events during the game (see Scoring below).

Each game lasts two minutes and the player has four lives. When the game time has elapsed **or** the player
has used all four lives, the game is over.

### Player Movement
Move the player using the arrow keys: up, down, left, and right.

### Player Change
Selecting the Ctrl key while hitting the up or down arrow changes the active player. This can be done
at any point in the game, even when it's paused, so you can learn the order of the players.

### Defeating Enemies
When the player is hit my an enemy bug, the player is killed and sent back to home position on the board.
But not always. Each player has a special *Super Power* over one enemy type. Your job is to figure
out which player defeats which enemy.

> Hint: Each player has a coloring scheme that may help you figure out which enemy it can defeat.

> Changing the player on the fly to defeat enemies is the key to this game. Use your knowledge of the
player order and quick fingers to change the player on the fly and defeat enemies (and get tons of points)!

### Scoring
Points are awarded for the following:
| Event                                            | Points   |
| ------------------------------------------------ | --------:|
| Each full second in play (not in the grass area) | 1000     |
| Cleaning up after the ladybugs                   | 5000     |
| Defeating a Enemy - Green                        | 2000     |
| Defeating a Enemy - Blue                         | 4000     |
| Defeating a Enemy - Yellow                       | 6000     |
| Defeating a Enemy - Purple                       | 8000     |
| Defeating a Enemy - Red                          | 10000    |

### Help
The Game Rules and Hints and much of the information below is available in-game. The rules are displayed
when the game is started for the first time and when ever the 'Game Info' link is selected.

> There are multiple pages of information that can be cycled through using the left and right arrow keys.

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
