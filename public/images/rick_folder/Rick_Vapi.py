import os
import json
import requests
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, MessagesPlaceholder, HumanMessagePromptTemplate

#########################################################################################
## API and model initialization
#########################################################################################

# Set up API key for OpenAI and Vapi
os.environ["OPENAI_API_KEY"] = "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"
vapi_api_key = "your_vapi_api_key"
vapi_assistant_id = "your_vapi_assistant_id"

# Function to get voice response from Vapi
def get_voice_response(text_input):
    url = f"https://api.vapi.ai/assistant/{vapi_assistant_id}/interact"
    headers = {"Authorization": f"Bearer {vapi_api_key}"}
    data = {"input": text_input}
    response = requests.post(url, headers=headers, json=data)
    return response.json().get("output")

#########################################################################################
## Character creation
#########################################################################################

# Define role names
char_name = "Rick Sanchez"
user_role_name = "Pete"

# defining LLM and memory
llm = ChatOpenAI(model= 'gpt-4', temperature = .8)
memory = ConversationBufferMemory(return_messages = True)

# creating a class to create conversation chains based on description
class CharCreationChain(ConversationChain):
    @classmethod
    def from_description(cls, description) -> ConversationChain:
        prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(description.replace('{user_role_name}', user_role_name)),
            MessagesPlaceholder(variable_name = "history"),
            HumanMessagePromptTemplate.from_template("{input}")
        ])
        return cls(prompt=prompt, llm=llm, memory = memory)

# Read character descriptions from JSON file
with open('C:\\Users\\Thoma\\Desktop\\Cyber Pete 2.1\\Rick Sanchez Beta MVP\\new character\\The_Pitt\\Rick_Folder\\character_descriptions.json', 'r') as f:
    char_descriptions = json.load(f)
    
# Form complete description for Rick Sanchez
rick_desc = char_descriptions.get("Rick Sanchez", "")

# Your character descriptions
char_descriptions = {
    "Rick Sanchez": rick_desc
}

# Create the chains for each character
char_chains = {
    name: CharCreationChain.from_description(desc)
    for name, desc in char_descriptions.items()
}

##########################################################################################################################
## Define This InteractionManager
##########################################################################################################################

class InteractionManager:
    def __init__(self, rick_chain):
        self.rick_chain = rick_chain
        self.topic = None

    def set_topic(self, topic):
        self.topic = topic
 
    def get_response(self, speaker, message):
        if speaker == "User":
            if not self.topic:
                self.set_topic(message)
            response = self.rick_chain.predict(input=message)
            return response, "Rick"

class ColorText:
    User = '\033[96m'
    Rick = '\033[92m'
    END = '\033[0m'

def start_chat_with_voice(user_role_name='Pete', rick_chain=None):
    manager = InteractionManager(rick_chain)
    print(f"Welcome to This Reality!, {ColorText.User}{user_role_name}{ColorText.END}\n")

    while True:
        user_input = input(f"{ColorText.User}{user_role_name}, set This topic (or 'quit' to exit): {ColorText.END}")
        if user_input.lower() == 'quit':
            print("Exiting This Reality!...")
            break

        response, responder_name = manager.get_response("User", user_input)
        voice_response = get_voice_response(response)  # Convert text response to voice
        print(f"{getattr(ColorText, responder_name)}{responder_name} says (voice response): {voice_response}{ColorText.END}")

        user_input = input(f"{ColorText.User}Enter 'quit' to exit or press Enter to continue: {ColorText.END}")
        if user_input.lower() == 'quit':
            print("Exiting This Reality!...")
            break

if __name__ == "__main__":
    start_chat_with_voice(user_role_name=user_role_name, rick_chain=char_chains['Rick Sanchez'])
