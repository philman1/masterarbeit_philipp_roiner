<template>
	<div class="v-bounce v-bounce1" v-bind:style="spinnerBasicStyle">
		<div
			class="v-bounce v-bounce2 bg-sol-green"
			v-bind:style="spinnerStyle"
		></div>
		<div
			class="v-bounce v-bounce3 bg-sol-green"
			v-bind:style="spinnerStyle"
		></div>
	</div>
</template>

<script>
export default {
	name: "BounceLoader",

	props: {
		size: {
			type: String,
			default: "60px",
		},
		margin: {
			type: String,
			default: "2px",
		},
		radius: {
			type: String,
			default: "100%",
		},
	},
	data() {
		return {
			spinnerStyle: {
				height: this.size,
				width: this.size,
				borderRadius: this.radius,
				opacity: 0.6,
				position: "absolute",
				top: 0,
				left: 0,
			},
		};
	},
	computed: {
		spinnerBasicStyle() {
			return {
				height: this.size,
				width: this.size,
				position: "relative",
			};
		},
	},
};
</script>

<style>
.v-bounce2 {
	-webkit-animation: v-bounceStretchDelay 2s 1s infinite ease-in-out;
	animation: v-bounceStretchDelay 2s 1s infinite ease-in-out;
	-webkit-animation-fill-mode: both;
	animation-fill-mode: both;
}

.v-bounce3 {
	-webkit-animation: v-bounceStretchDelay 2s 0s infinite ease-in-out;
	animation: v-bounceStretchDelay 2s 0s infinite ease-in-out;
	-webkit-animation-fill-mode: both;
	animation-fill-mode: both;
}

@-webkit-keyframes v-bounceStretchDelay {
	0%,
	100% {
		-webkit-transform: scale(0);
		transform: scale(0);
	}
	50% {
		-webkit-transform: scale(1);
		transform: scale(1);
	}
}

@keyframes v-bounceStretchDelay {
	0%,
	100% {
		-webkit-transform: scale(0);
		transform: scale(0);
	}
	50% {
		-webkit-transform: scale(1);
		transform: scale(1);
	}
}
</style>
