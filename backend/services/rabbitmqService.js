import amqp from "amqplib";

const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://rabbitmq";

let channelPromise;

async function getChannel() {
    if (!channelPromise) {
        channelPromise = amqp.connect(rabbitmqUrl)
            .then(async (connection) => {
                const channel = await connection.createChannel();
                await channel.assertQueue("registration-email", { durable: true });
                return channel;
            })
            .catch((error) => {
                channelPromise = null;
                throw error;
            });
    }

    return channelPromise;
}

export async function publishToQueue(queue, data) {
    const channel = await getChannel();

    channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    );
}
