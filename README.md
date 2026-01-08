# Wild Cards

## Deployment link

https://giovannidevs.github.io/wild-cards/

## About

Wild Cards is a single-page card matching game where players flip cards to find pairs while racing against a timer. The twist: unmatched cards regularly swap positions during gameplay, adding an extra layer of challenge to the classic memory game.

![alt text](<assets/images/For README/mockup.png>)

## User Value:

Players enjoy a fresh take on the classic memory game with entertaining themes and adjustable difficulty levels that match their skill. The dynamic card-swapping mechanic and strategic power-ups provide an exciting challenge that keeps every playthrough engaging and unpredictable.

## Core Features

- **Interactive Card Matching** - Click cards to flip and reveal, match pairs to win
- **Dynamic Card Shuffling** - Cards swap positions during gameplay for added challenge
- **Timer System** - Track performance with countdown/timer functionality
- **Randomized Card Placement** - Every game has a unique layout
- **Responsive Design** - Fully playable on desktop and mobile devices
- **Game End Screen** - Win/lose conditions with restart option

## Enhanced Features

- **Difficulty Levels** - Choose between Easy (1:30), Medium (1:00), and Hard (00:30)
  
![Difficulty Levels](assets/images/For%20README/difficulty.png)

- **Personalised Name** - Enter your name for a customized experience using LocalStorage

![Personalised Name](assets/images/For%20README/changename.png)

- **Score Calculation** - Performance-based scoring system tracking times

![Score Calculation](assets/images/For%20README/score.png)

- **Leaderboard** - Top 10 players have their name saved in a local hiscore table

![Leaderboard](assets/images/For%20README/leaderboard.png)

- **Smooth Animations** - Card flip animations and transitions

## Technologies Used

- HTML5 – Structure and markup for the web application.
- CSS3 (with Bootstrap 5) – Styling, layout, and responsive design.
- JavaScript (ES6) – Game logic, interactivity, and UI behavior.
- Lighthouse – Accessibility and performance auditing.
- W3C Markup Validation Service – HTML validation and code quality checks.
- Google Fonts - Rubik Bubbles, Space Grotesk, Sans Serif

## Wireframes

![alt text](<assets/images/For README/wire2.webp>)
![alt text](<assets/images/For README/wire3.png>)

## Color Scheme

![alt text](<assets/images/For README/wire1.webp>)

## Deployment procedure

This site is deployed using GitHub Pages, which provides free static site hosting directly from a GitHub repository.

**Steps:**

1. Push all project files to a GitHub repository
2. Navigate to the repository Settings on GitHub
3. Select the "Pages" section from the left sidebar
4. Under "Source," select the branch to deploy (typically `main`)
5. Choose the root folder (`/root`) as the source directory
6. Click Save
7. GitHub Pages will automatically build and deploy the site within a few minutes
8. The live site URL will be displayed in the Pages section (format: [`https://username.github.io/repository-name/`](https://username.github.io/repository-name/))

The site updates automatically whenever changes are pushed to the selected branch.

# Tests results

## Google Lighthouse

![alt text](<assets/images/For README/deskval.webp>)
![alt text](<assets/images/For README/mobileVAL.webp>)

## HTML Validation

![alt text](<assets/images/For README/htmlval.png>)

## CSS Validation

![alt text](<assets/images/For README/cssval.png>)

## JS Validation

![alt text](<assets/images/For README/jsval.webp>)

## Known Issues / Roadmap

- Cards should stack in a cleaner way when on small screen devices.
- On Firefox swap animation doen't work properly.

## AI use

**Code Generation**

AI was used to explore various game features and help understand the logic behind complex mechanics like dynamic card swapping and match detection. By working through implementation approaches with AI, the team gained deeper insight into DOM manipulation techniques and event handling strategies that shaped the final code.

**AI debugging**

AI debugging helped resolve both simple and complex issues throughout development, from identifying duplicated IDs and CSS styling conflicts to fixing the logic of more advanced features. This support streamlined the troubleshooting process, allowing the team to quickly diagnose problems and implement effective solutions across all aspects of the game.

**AI for better UX**

AI was used to suggest accessibility improvements such as ARIA labels and enhanced visual feedback for interactive elements.

**AI and workflow**

AI assisted in generating user stories with acceptance criteria and breaking down features into actionable tasks, helping to structure the project backlog effectively. AI support was also utilized for documentation writing and resolving merge conflicts during collaborative development, streamlining team workflow and reducing friction in the version control process.

## Credits

### Member who worked on this project.

**Terence Reilly**

**Giovanni D'Amico**

**Iain Kirkham**

**Viktor Goönczöl**

**Valentino Farias**
