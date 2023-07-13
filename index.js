const canvas = document.querySelector("canvas");

const canvasContext = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

//fillRect takes 4 arguments, position x, position y, width, height
canvasContext.fillRect(0, 0, 1024, 576);

const gravity = 0.8;

class Sprite {
	//passing as an object to not having problems with which one is called first
	constructor({ position, velocity, color = "red", offset }) {
		this.position = position;
		this.velocity = velocity;
		this.height = 150;
		this.width = 50;
		this.lastKey;

		//attacks
		this.attackBox = {
			position: {
				x: this.position.x,
				y: this.position.y,
			},
			width: 100,
			height: 50,

			offset,
		};
		this.color = color;
		this.isAttacking;

		// health
		this.health = 100;
	}
	draw() {
		canvasContext.fillStyle = this.color;
		canvasContext.fillRect(
			this.position.x,
			this.position.y,
			this.width,
			this.height
		);

		//attacks

		if (this.isAttacking) {
			canvasContext.fillStyle = "green";
			canvasContext.fillRect(
				this.attackBox.position.x,
				this.attackBox.position.y,
				this.attackBox.width,
				this.attackBox.height
			);
		}
	}

	update() {
		this.draw();
		this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
		this.attackBox.position.y = this.position.y;

		this.position.x += this.velocity.x;

		this.position.y += this.velocity.y;

		this.position.y + this.height + this.velocity.y >= canvas.height
			? (this.velocity.y = 0)
			: (this.velocity.y += gravity);
	}
	attack() {
		this.isAttacking = true;
		setTimeout(() => {
			this.isAttacking = false;
		}, 100);
	}
}

const player = new Sprite({
	position: {
		x: 0,
		y: 0,
	},
	velocity: {
		x: 0,
		y: 0,
	},
	offset: {
		x: 0,
		y: 0,
	},
});

const enemy = new Sprite({
	color: "blue",
	position: {
		x: 400,
		y: 0,
	},
	velocity: {
		x: 0,
		y: 0,
	},
	offset: {
		x: -50,
		y: 0,
	},
});

const keys = {
	a: {
		pressed: false,
	},
	d: {
		pressed: false,
	},
	w: {
		pressed: false,
	},
	ArrowLeft: {
		pressed: false,
	},
	ArrowRight: {
		pressed: false,
	},

	ArrowUp: {
		pressed: false,
	},
};

const rectCollision = ({ rect1, rect2 }) => {
	return (
		rect1.attackBox.position.x + rect1.attackBox.width >= rect2.position.x &&
		rect1.attackBox.position.x <= rect2.position.x + rect2.width &&
		rect1.attackBox.position.y + rect1.attackBox.height >= rect2.position.y &&
		rect1.attackBox.position.y <= rect2.position.y + rect2.height
	);
};

function winner({ player, enemy, timerId }) {
	clearTimeout(timerId);
	document.querySelector("#result").style.display = "flex";
	if (player.health === enemy.health) {
		document.querySelector("#result").innerHTML = "TIE";
	} else if (player.health < enemy.health) {
		document.querySelector("#result").innerHTML = "P2 wins";
	} else if (player.health > enemy.health) {
		document.querySelector("#result").innerHTML = "P1 wins";
	}
}

let timer = 60;
let timerId;
function decTimer() {
	timerId = setTimeout(decTimer, 1000);
	if (timer > 0) {
		timer--;
		document.querySelector("#timer").innerHTML = timer;
	}

	if (timer === 0) {
		winner({ player, enemy, timerId });
	}
}
decTimer({ player, enemy });

const animate = () => {
	window.requestAnimationFrame(animate);
	canvasContext.fillStyle = "black";
	canvasContext.fillRect(0, 0, canvas.width, canvas.height);
	player.update();
	enemy.update();

	player.velocity.x = 0;
	if (keys.a.pressed && player.lastKey === "a") {
		player.velocity.x = -5;
	} else if (keys.d.pressed && player.lastKey === "d") {
		player.velocity.x = 5;
	}

	enemy.velocity.x = 0;
	if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
		enemy.velocity.x = -5;
	} else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
		enemy.velocity.x = 5;
	}

	//collision

	if (
		rectCollision({
			rect1: player,
			rect2: enemy,
		}) &&
		player.isAttacking
	) {
		player.isAttacking = false;
		enemy.health -= 10;
		document.querySelector("#p2Health").style.width = enemy.health + "%";
		console.error("p1 hit p2");
	}

	if (
		rectCollision({
			rect1: enemy,
			rect2: player,
		}) &&
		enemy.isAttacking
	) {
		enemy.isAttacking = false;
		player.health -= 10;
		document.querySelector("#p1Health").style.width = player.health + "%";
		console.error("p2 hit p1");
	}

	// end game

	if (enemy.health <= 0 || enemy.health <= 0) {
		winner({ player, enemy, timerId });
	}
};

animate();

//player movement
window.addEventListener("keydown", (event) => {
	switch (event.key) {
		case "d":
			keys.d.pressed = true;
			player.lastKey = "d";
			break;
		case "a":
			keys.a.pressed = true;
			player.lastKey = "a";
			break;
		case "w":
			keys.w.pressed = true;
			player.velocity.y = -20;
			break;
		case " ":
			player.attack();
			break;

		// 2nd player movement
		case "ArrowRight":
			keys.ArrowRight.pressed = true;
			enemy.lastKey = "ArrowRight";
			enemy.velocity.x = 1;
			break;
		case "ArrowLeft":
			keys.ArrowLeft.pressed = true;
			enemy.lastKey = "ArrowLeft";
			enemy.velocity.x = -1;
			break;
		case "ArrowUp":
			keys.w.pressed = true;
			enemy.velocity.y = -20;
			break;
		case "ArrowDown":
			enemy.attack();
			break;
	}
});

window.addEventListener("keyup", (event) => {
	switch (event.key) {
		//1st player keys
		case "d":
			keys.d.pressed = false;
			break;
		case "a":
			keys.a.pressed = false;
			break;

		case "w":
			keys.w.pressed = false;
			break;

		//2nd player keys
		case "ArrowRight":
			keys.ArrowRight.pressed = false;
			break;
		case "ArrowLeft":
			keys.ArrowLeft.pressed = false;
			break;
		case "ArrowUp":
			keys.w.pressed = false;
			break;
	}
});
