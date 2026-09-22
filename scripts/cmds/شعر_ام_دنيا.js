module.exports = {
	config: {
		name: "شعر ام دنيا",
		version: "1.0",
		author: "YourName",
		countDown: 3,
		role: 0,
		description: "Send the poem",
		category: "fun",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ message }) {
		const text = `يا ام دنيا كم رأت عيني من مؤخرة ولم تعجب بها قط
ولاكن عندما جفت عيوني في مؤخرتك قال قلبي:
هذه المؤخرة ما لم ترى عيني قط
يا ام دنيا اني احببت مؤخرتك كوسادة تهديها للبراني
ولا تهديها لناس لي يحبوك

يااا ام دنيا جينا طالبين راغبين فيد طبـونڪ لمزغب 😗🥺`;

		return message.reply(text);
	}
};
