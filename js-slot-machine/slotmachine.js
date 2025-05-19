const prompt = require("prompt-sync")();
const chalk = require("chalk"); 

// Game Configuration
const ROWS = 3;
const COLS = 3;

const SYMBOLS_COUNT = {
    J: 1,  // Rare high-value symbol
    A: 2,
    B: 4,
    C: 6,
    D: 8
};

const SYMBOLS_VALUES = {
    J: 10, // Pays 10x bet
    A: 5,
    B: 4,
    C: 3,
    D: 2
};

// Colors for symbols (optional)
const SYMBOL_COLORS = {
    J: chalk.red.bold,
    A: chalk.green.bold,
    B: chalk.blue.bold,
    C: chalk.yellow.bold,
    D: chalk.magenta.bold
};

// --- Core Functions ---

// Deposit money
const deposit = () => {
    while (true) {
        const depositAmount = prompt(chalk.cyan("Enter amount to deposit: $"));
        const numberDepositAmount = parseFloat(depositAmount);

        if (isNaN(numberDepositAmount) || numberDepositAmount <= 0) {
            console.log(chalk.red("❌ Invalid amount. Please try again."));
        } else {
            return numberDepositAmount;
        }
    }
};

// Choose number of lines (1-3)
const getNumberOfLines = () => {
    while (true) {
        const lines = prompt(chalk.cyan("Enter lines to bet (1-3): "));
        const numberOfLines = parseFloat(lines);

        if (isNaN(numberOfLines) || numberOfLines <= 0 || numberOfLines > 3) {
            console.log(chalk.red("❌ Invalid lines. Choose 1, 2, or 3."));
        } else {
            return numberOfLines;
        }
    }
};

// Choose bet amount (with max bet option)
const getBet = (balance, lines) => {
    while (true) {
        const betPrompt = prompt(
            chalk.cyan(`Enter bet per line (Max: $${(balance / lines).toFixed(2)}, or type "max" to bet all): `)
        );

        let amountToBet;
        if (betPrompt.toLowerCase() === "max") {
            amountToBet = balance / lines;
        } else {
            amountToBet = parseFloat(betPrompt);
        }

        if (isNaN(amountToBet) || amountToBet <= 0 || amountToBet > balance / lines) {
            console.log(chalk.red("❌ Invalid bet. Try again."));
        } else {
            return amountToBet;
        }
    }
};

// Generate random reels
const spin = () => {
    const symbols = [];
    for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
        for (let i = 0; i < count; i++) {
            symbols.push(symbol);
        }
    }

    const reels = [];
    for (let i = 0; i < COLS; i++) {
        const reelSymbols = [...symbols];
        const currentReel = [];
        for (let j = 0; j < ROWS; j++) {
            const randomIndex = Math.floor(Math.random() * reelSymbols.length);
            currentReel.push(reelSymbols[randomIndex]);
            reelSymbols.splice(randomIndex, 1);
        }
        reels.push(currentReel);
    }

    return reels;
};

// Transpose(convert) reels into rows for display
const transpose = (reels) => {
    const rows = [];
    for (let i = 0; i < ROWS; i++) {
        rows.push([]);
        for (let j = 0; j < COLS; j++) {
            rows[i].push(reels[j][i]);
        }
    }
    return rows;
};

// Print slot machine result with colors
const printRows = (rows) => {
    console.log("\n" + chalk.bold("=== SLOT MACHINE ==="));
    for (const row of rows) {
        let rowString = "";
        for (const [i, symbol] of row.entries()) {
            rowString += SYMBOL_COLORS[symbol](symbol);
            if (i !== row.length - 1) {
                rowString += " | ";
            }
        }
        console.log(rowString);
    }
    console.log(chalk.bold("===================\n"));
};

// Calculate winnings
const getWinnings = (rows, bet, lines) => {
    let winnings = 0;
    for (let row = 0; row < lines; row++) {
        const symbols = rows[row];
        const firstSymbol = symbols[0];
        const isWin = symbols.every(symbol => symbol === firstSymbol);

        if (isWin) {
            winnings += bet * SYMBOLS_VALUES[firstSymbol];
            console.log(chalk.green(`🎉 Line ${row + 1} wins: $${(bet * SYMBOLS_VALUES[firstSymbol]).toFixed(2)}!`));
        }
    }
    return winnings;
};

// Main game loop
const game = () => {
    console.log(chalk.bold.blue("\n💰 Welcome to the JavaScript Slot Machine! 💰\n"));
    let balance = deposit();

    while (true) {
        console.log(chalk.bold(`Current Balance: $${balance.toFixed(2)}`));
        const numberOfLines = getNumberOfLines();
        const bet = getBet(balance, numberOfLines);
        const totalBet = bet * numberOfLines;

        balance -= totalBet;
        console.log(chalk.yellow(`\nBetting $${totalBet.toFixed(2)} on ${numberOfLines} line(s)...`));

        const reels = spin();
        const rows = transpose(reels);
        printRows(rows);

        const winnings = getWinnings(rows, bet, numberOfLines);
        balance += winnings;

        if (winnings > 0) {
            console.log(chalk.green.bold(`✨ You won: $${winnings.toFixed(2)}! ✨`));
        } else {
            console.log(chalk.red("😢 No wins this time."));
        }

        if (balance <= 0) {
            console.log(chalk.red("\n💸 You're out of money! Game over."));
            break;
        }

        const playAgain = prompt(chalk.cyan("\nPlay again? (y/n): ")).toLowerCase();
        if (playAgain !== "y") {
            console.log(chalk.bold(`\n🏁 Final Balance: $${balance.toFixed(2)}`));
            console.log(chalk.blue("Thanks for playing! 🎰"));
            break;
        }
    }
};

// Start playing
game();