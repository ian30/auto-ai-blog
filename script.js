//topics we want our AI to write about: 
const contentTopics = {
    "Technology": [
        "AI",
        "Cybersecurity",
        "Robotics",
        "Internet of Things",
    ],
    "Business": [
        "Finance",
        "Marketing",
        "Entrepreneurship",
        "Business Strategy",
        "Entrepreneurial Finance",
        "Business Intelligence",
        "Business Consulting",
        "Business Analysis",
    ],
    "Philosophy": [
        "Epistemology",
        "Metaphysics",
        "Philosophy of Mind",
        "Philosophy of Language"

    ],
    "Science": [
        "Chemistry",
        "Physics",
        "Biology",
        "Genetics",
        "Ecology",
        "Mathematics"
    ],
    "Space": [
        "Astrophysics",
        "Astronomy",
        "Solar Systems",
        "Space Exploration",
        "Space Technology"
    ],
    "Cryptocurrency": [
        "Bitcoin",
        "Ethereum",
        "Ripple",
        "Litecoin",
        "blockchain",
        "coinbase",
    ]
}
let selectMainTopic, selectSubTopic, subTopics, mainTopics;
function pickRandomTopic(topics) {//loop thru "contentTopics" and choose a random topic and its parent topic:
    mainTopics = Object.keys(topics);
    selectMainTopic = mainTopics[Math.floor(Math.random() * mainTopics.length)];
    subTopics = topics[selectMainTopic];
    selectSubTopic = subTopics[Math.floor(Math.random() * subTopics.length)];
    return selectSubTopic, selectMainTopic;
}
let mainTopic = pickRandomTopic(contentTopics);
let subTopic = pickRandomTopic(contentTopics);
function setArticleLenfth() {
    const minWordLength = 350;
    const maxWordLength = 1000;
    const articleLength = Math.round(Math.floor(Math.random() * (maxWordLength - minWordLength + 1) + minWordLength) / 100) * 100; //getting randome length and rounding nearest 100
    return articleLength;
}
function getAPIkey() {//get API key from URL
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('apiKey');
}
const endpoint = 'https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions';
let prompt = `As an expert in the field of ${mainTopic}, Write a post about ${subTopic} that is about or less than ${setArticleLenfth()} words long. Please include a title for the post.`;
console.log('prompt: ', prompt);
async function generateBlogPost() {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${getAPIkey()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: setArticleLenfth(),
                temperature: 0.7
            })
        });
        const data = await response.json();
        const text = data.choices[0].text;
        let blogTitle;
        let updatedText;
        function extractTitle(text) {
            const titleRegex = /Title: (.*)/;
            const match = titleRegex.exec(text);
            if (match) {
                blogTitle = match[1];
                updatedText = text.replace(titleRegex, '');
                return { blogTitle, updatedText };
            } else {
                return { firstSentence: "No title sentence found.", updatedText: text };
            }
        }
        extractTitle(text);
        let editorResponse;
        const askAIeditor = `As an experienced editor with 20 years in the field of journalism, review ${updatedText}, write a short summary about it and tell me what you think about the quality of the post.`;
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${getAPIkey()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: askAIeditor,
                    max_tokens: 150,
                    temperature: 0.3
                })
            })
            editorResponse = await response.json();
            console.log('editorResponse: ', editorResponse.choices[0].text);
        } catch (error) {
            console.error(error);
        }
        const localStore = {
            title: blogTitle,
            text: updatedText,
            editorResponse: editorResponse.choices[0].text
        }
        let formattedParagraph;
        for (const paragraph of text.split('\n\n')) {
            if (!paragraph) continue;//skip empty paragraphs
            if (paragraph.includes('Title:')) continue;//skip title
            if (paragraph.textContent === "undefined") continue;//skip undefined
            formattedParagraph += `<p>${paragraph}</p>`;//adding <p> tags to each paragraph
        }
        const container = document.getElementById('genContent');
        const postHTML = `
            <h1 class='post-title'>${blogTitle}</h1>
            <div class='post-content'>${formattedParagraph}</div>
            <hr>
            <div class='post-editor-response'>${editorResponse.choices[0].text}</div>
        `;
        container.innerHTML = postHTML;
        const postContent = document.querySelector('.post-content');
        if (postContent) {
            postContent.innerHTML = postContent.innerHTML.replace('undefined', '');
        }
        localStorage.setItem('GPT Blog Posts', JSON.stringify(localStore));
        return { blogTitle, updatedText };
    } catch (error) {
        console.error(error);
    }
}
generateBlogPost();
