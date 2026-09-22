javascript
module.exports = {
  config: {
    name: 'threadname',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    groupAdminOnly: true,
    description: 'Changes the group name.',
    category: 'group',
    guide: {
      en: '   {pn} [new_thread_name]'
    },
  },
  onStart: async ({ api, event, args }) => {
    try {
      const newThreadName = args.join(' ');

      if (!newThreadName) {
        return api.sendMessage('Please provide a new name for the group.', event.threadID);
      }

      api.setTitle(newThreadName, event.threadID, (err) => {
        if (err) {
          console.error("Failed to change thread name:", err);
          return api.sendMessage('Failed to change group name. Make sure the bot has admin privileges in this group.', event.threadID);
        }
        api.sendMessage(`Successfully changed group name to '${newThreadName}'.`, event.threadID);
      });

    } catch (error) {
      console.error("Error in threadname command:", error);
      api.sendMessage('An error occurred while trying to change the group name.', event.threadID);
    }
  },
};
