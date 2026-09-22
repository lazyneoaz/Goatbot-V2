const { getStreamFromURL, uploadImgbb } = global.utils;

module.exports = {
	config: {
		name: "antichangeinfobox",
		aliases: ["protect"],
		version: "2.0",
		author: "Ismail",
		countDown: 3,
		role: 1,
		description: {
			en: "Protect group information from unauthorized changes"
		},
		category: "box chat",
		guide: {
			en:
				"{pn} on\n" +
				"{pn} off\n\n" +
				"{pn} avt on/off\n" +
				"{pn} name on/off\n" +
				"{pn} nickname on/off\n" +
				"{pn} theme on/off\n" +
				"{pn} emoji on/off"
		}
	},

	langs: {
		en: {
			on:
				"▬▬▬▬▬▬▬▬▬▬▬▬\n" +
				"🔒 𝗣𝗥𝗢𝗧𝗘𝗖𝗧 𝗢𝗡\n" +
				"▬▬▬▬▬▬▬▬▬▬▬▬\n\n" +
				"🖼️ Group Photo: ✅\n" +
				"📝 Group Name: ✅\n" +
				"👤 Nicknames: ✅\n" +
				"🎨 Theme: ✅\n" +
				"😀 Emoji: ✅\n\n" +
				"🛡️ Group information is now protected.\n" +
				"▬▬▬▬▬▬▬▬▬▬▬▬",

			off:
				"▬▬▬▬▬▬▬▬▬▬▬▬\n" +
				"🔓 𝗣𝗥𝗢𝗧𝗘𝗖𝗧 𝗢𝗙𝗙\n" +
				"▬▬▬▬▬▬▬▬▬▬▬▬\n\n" +
				"🛡️ Group information protection has been disabled.\n\n" +
				"▬▬▬▬▬▬▬▬▬▬▬▬",

			avatarOn: "🖼️ Group photo protection: ON",
			avatarOff: "🖼️ Group photo protection: OFF",
			nameOn: "📝 Group name protection: ON",
			nameOff: "📝 Group name protection: OFF",
			nicknameOn: "👤 Nickname protection: ON",
			nicknameOff: "👤 Nickname protection: OFF",
			themeOn: "🎨 Theme protection: ON",
			themeOff: "🎨 Theme protection: OFF",
			emojiOn: "😀 Emoji protection: ON",
			emojiOff: "😀 Emoji protection: OFF",

			noPhoto:
				"❌ I couldn't find the current group photo.",

			restorePhoto:
				"🛡️ Someone changed the group photo. Restoring the protected photo...",

			restoreName:
				"🛡️ Someone changed the group name. Restoring it...",

			restoreNickname:
				"🛡️ Someone changed a group nickname. Restoring it...",

			restoreTheme:
				"🛡️ Someone changed the group theme. Restoring it...",

			restoreEmoji:
				"🛡️ Someone changed the group emoji. Restoring it..."
		}
	},

	onStart: async function ({
		message,
		event,
		args,
		threadsData,
		getLang
	}) {
		const threadID = event.threadID;

		if (!args[0]) {
			return message.reply(
				"▬▬▬▬▬▬▬▬▬▬▬▬\n" +
				"🛡️ 𝗣𝗥𝗢𝗧𝗘𝗖𝗧\n" +
				"▬▬▬▬▬▬▬▬▬▬▬▬\n\n" +
				"protect on\n" +
				"protect off\n\n" +
				"protect avt on/off\n" +
				"protect name on/off\n" +
				"protect nickname on/off\n" +
				"protect theme on/off\n" +
				"protect emoji on/off\n\n" +
				"▬▬▬▬▬▬▬▬▬▬▬▬"
			);
		}

		const first = args[0].toLowerCase();
		const second = args[1]?.toLowerCase();

		let data = await threadsData.get(
			threadID,
			"data.antiChangeInfoBox",
			{}
		);

		data = data || {};

		/*
		 * protect on
		 * تشغيل جميع أنواع الحماية
		 */
		if (
			(first === "on" || first === "off") &&
			!second
		) {
			const enabled = first === "on";

			if (!enabled) {
				await threadsData.set(
					threadID,
					{},
					"data.antiChangeInfoBox"
				);

				return message.reply(
					getLang("off")
				);
			}

			try {
				const info =
					await threadsData.get(threadID);

				/*
				 * حفظ اسم المجموعة
				 */
				if (info.threadName) {
					data.name = info.threadName;
				}

				/*
				 * حفظ جميع الكنيات
				 */
				if (Array.isArray(info.members)) {
					const nicknames = {};

					for (const member of info.members) {
						if (
							member.userID &&
							member.nickname !== undefined
						) {
							nicknames[member.userID] =
								member.nickname;
						}
					}

					data.nickname = nicknames;
				}

				/*
				 * حفظ الثيم
				 */
				if (info.threadThemeID) {
					data.theme =
						info.threadThemeID;
				}

				/*
				 * حفظ الإيموجي
				 */
				if (info.emoji !== undefined) {
					data.emoji = info.emoji;
				}

				/*
				 * حفظ صورة المجموعة
				 *
				 * نحاول الحصول عليها من threadsData
				 */
				if (info.imageSrc) {
					try {
						const uploaded =
							await uploadImgbb(
								info.imageSrc
							);

						if (
							uploaded?.image?.url
						) {
							data.avatar =
								uploaded.image.url;
						}
					} catch (err) {
						console.error(
							"[PROTECT PHOTO SAVE]",
							err
						);
					}
				}

				await threadsData.set(
					threadID,
					data,
					"data.antiChangeInfoBox"
				);

				return message.reply(
					getLang("on")
				);
			} catch (error) {
				console.error(
					"[PROTECT ON]",
					error
				);

				return message.reply(
					"❌ حدث خطأ أثناء تفعيل الحماية."
				);
			}
		}

		/*
		 * حماية منفردة
		 */
		const typeMap = {
			avt: "avatar",
			avatar: "avatar",
			image: "avatar",
			name: "name",
			nickname: "nickname",
			theme: "theme",
			emoji: "emoji"
		};

		const type = typeMap[first];

		if (!type) {
			return message.reply(
				"❌ Unknown protection type."
			);
		}

		if (
			second !== "on" &&
			second !== "off"
		) {
			return message.reply(
				`❌ Use:\nprotect ${first} on\nprotect ${first} off`
			);
		}

		/*
		 * OFF
		 */
		if (second === "off") {
			delete data[type];

			await threadsData.set(
				threadID,
				data,
				"data.antiChangeInfoBox"
			);

			const langKey =
				type === "avatar"
					? "avatarOff"
					: `${type}Off`;

			return message.reply(
				getLang(langKey)
			);
		}

		/*
		 * ON
		 */
		try {
			const info =
				await threadsData.get(threadID);

			if (type === "avatar") {
				if (!info.imageSrc) {
					return message.reply(
						getLang("noPhoto")
					);
				}

				const uploaded =
					await uploadImgbb(
						info.imageSrc
					);

				if (
					!uploaded?.image?.url
				) {
					return message.reply(
						"❌ Failed to save group photo."
					);
				}

				data.avatar =
					uploaded.image.url;

			} else if (type === "name") {
				data.name =
					info.threadName || "";

			} else if (type === "nickname") {
				const nicknames = {};

				if (Array.isArray(info.members)) {
					for (const member of info.members) {
						if (
							member.userID
						) {
							nicknames[
								member.userID
							] =
								member.nickname || "";
						}
					}
				}

				data.nickname =
					nicknames;

			} else if (type === "theme") {
				data.theme =
					info.threadThemeID;

			} else if (type === "emoji") {
				data.emoji =
					info.emoji;
			}

			await threadsData.set(
				threadID,
				data,
				"data.antiChangeInfoBox"
			);

			const langKey =
				type === "avatar"
					? "avatarOn"
					: `${type}On`;

			return message.reply(
				getLang(langKey)
			);
		} catch (error) {
			console.error(
				"[PROTECT TYPE]",
				error
			);

			return message.reply(
				"❌ حدث خطأ أثناء تفعيل الحماية."
			);
		}
	},

	onEvent: async function ({
		message,
		event,
		threadsData,
		role,
		api,
		getLang
	}) {
		const {
			threadID,
			logMessageType,
			logMessageData,
			author
		} = event;

		const data =
			await threadsData.get(
				threadID,
				"data.antiChangeInfoBox",
				{}
			);

		if (!data || !Object.keys(data).length)
			return;

		/*
		 * لا نعاقب مشرفي المجموعة
		 * ولا البوت نفسه
		 */
		const botID =
			api.getCurrentUserID();

		const isBot =
			String(author) ===
			String(botID);

		const isAdmin =
			role >= 1;

		/*
		 * صورة المجموعة
		 */
		if (
			logMessageType ===
			"log:thread-image"
		) {
			if (!data.avatar)
				return;

			return async function () {
				if (
					isAdmin ||
					isBot
				) {
					/*
					 * إذا التغيير من المشرف،
					 * نحفظ الصورة الجديدة.
					 */
					const newURL =
						logMessageData?.url;

					if (newURL) {
						try {
							const uploaded =
								await uploadImgbb(
									newURL
								);

							if (
								uploaded?.image?.url
							) {
								await threadsData.set(
									threadID,
									uploaded.image.url,
									"data.antiChangeInfoBox.avatar"
								);
							}
						} catch {}
					}

					return;
				}

				await message.reply(
					getLang(
						"restorePhoto"
					)
				);

				try {
					const stream =
						await getStreamFromURL(
							data.avatar
						);

					await api.changeGroupImage(
						stream,
						threadID
					);
				} catch (error) {
					console.error(
						"[RESTORE PHOTO]",
						error
					);
				}
			};
		}

		/*
		 * اسم المجموعة
		 */
		if (
			logMessageType ===
			"log:thread-name"
		) {
			if (!Object.prototype.hasOwnProperty.call(data, "name"))
				return;

			return async function () {
				if (
					isAdmin ||
					isBot
				) {
					await threadsData.set(
						threadID,
						logMessageData.name,
						"data.antiChangeInfoBox.name"
					);
					return;
				}

				await message.reply(
					getLang(
						"restoreName"
					)
				);

				try {
					await api.setTitle(
						data.name,
						threadID
					);
				} catch (error) {
					console.error(
						"[RESTORE NAME]",
						error
					);
				}
			};
		}

		/*
		 * الكنية
		 */
		if (
			logMessageType ===
			"log:user-nickname"
		) {
			if (!data.nickname)
				return;

			return async function () {
				const {
					nickname,
					participant_id
				} = logMessageData;

				if (
					isAdmin ||
					isBot
				) {
					await threadsData.set(
						threadID,
						nickname,
						`data.antiChangeInfoBox.nickname.${participant_id}`
					);
					return;
				}

				await message.reply(
					getLang(
						"restoreNickname"
					)
				);

				const oldNickname =
					data.nickname[
						participant_id
					];

				try {
					await api.changeNickname(
						oldNickname || "",
						threadID,
						participant_id
					);
				} catch (error) {
					console.error(
						"[RESTORE NICKNAME]",
						error
					);
				}
			};
		}

		/*
		 * الثيم
		 */
		if (
			logMessageType ===
			"log:thread-color"
		) {
			if (!Object.prototype.hasOwnProperty.call(data, "theme"))
				return;

			return async function () {
				if (
					isAdmin ||
					isBot
				) {
					await threadsData.set(
						threadID,
						logMessageData.theme_id,
						"data.antiChangeInfoBox.theme"
					);
					return;
				}

				await message.reply(
					getLang(
						"restoreTheme"
					)
				);

				try {
					await api.changeThreadColor(
						data.theme ||
							"196241301102133",
						threadID
					);
				} catch (error) {
					console.error(
						"[RESTORE THEME]",
						error
					);
				}
			};
		}

		/*
		 * إيموجي المجموعة
		 */
		if (
			logMessageType ===
			"log:thread-icon"
		) {
			if (!Object.prototype.hasOwnProperty.call(data, "emoji"))
				return;

			return async function () {
				if (
					isAdmin ||
					isBot
				) {
					await threadsData.set(
						threadID,
						logMessageData.thread_icon,
						"data.antiChangeInfoBox.emoji"
					);
					return;
				}

				await message.reply(
					getLang(
						"restoreEmoji"
					)
				);

				try {
					await api.changeThreadEmoji(
						data.emoji,
						threadID
					);
				} catch (error) {
					console.error(
						"[RESTORE EMOJI]",
						error
					);
				}
			};
		}
	}
};
