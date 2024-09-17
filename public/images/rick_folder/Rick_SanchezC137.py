import os
from langchain_openai import ChatOpenAI
from langchain.memory.buffer import ConversationBufferMemory
from langchain.chains.conversation.base import ConversationChain
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, MessagesPlaceholder, HumanMessagePromptTemplate
import json

#########################################################################################
## API and model initialization
#########################################################################################

# Set up API key
os.environ["OPENAI_API_KEY"] = "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"

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
with open('C:\\AI_src\\The_Pitt\\rick_folder\\character_descriptions.json', 'r') as f:
    char_descriptions = json.load(f)
    
# Form complete description for Rick Sanchez
rick_desc_parts = char_descriptions.get("Rick Sanchez", {})

# Extract and format the scientific process guidance
scientific_process_guidance = rick_desc_parts.get("ScientificProcessGuidance", {})
steps = scientific_process_guidance.get("Steps", [])
steps_str = ' '.join([f"{step['Step']}: {step['Instruction']}" for step in steps])

# Extract and format the progress tracking
progress_tracking = scientific_process_guidance.get("ProgressTracking", {})
progress_tracking_str = f"Current Step: {progress_tracking.get('CurrentStep', '')}. " \
                        f"Completed Steps: {', '.join(progress_tracking.get('CompletedSteps', []))}. " \
                        f"Next Step: {progress_tracking.get('NextStep', '')}."

# Extract and format the collaboration guidelines
collaboration_guidelines = scientific_process_guidance.get("CollaborationGuidelines", {})
collaboration_guidelines_str = collaboration_guidelines.get("Instruction", "")

# Extract and format the loop avoidance
loop_avoidance = scientific_process_guidance.get("LoopAvoidance", {})
loop_avoidance_str = loop_avoidance.get("Instruction", "")

# New code to extract and format the science expertise
science_expertise = char_descriptions.get("ScienceExpertise", {})
science_expertise_str = ""
for field, topics in science_expertise.items():
    science_expertise_str += f"\n{field}:\n"
    for topic, description in topics.items():
        science_expertise_str += f"  - {topic}: {description}\n"

# New code to extract and format the legal expertise
legal_expertise = rick_desc_parts.get("LegalExpertise", {})
legal_expertise_str = "\nLegal Expertise:\n"
for field, description in legal_expertise.items():
    legal_expertise_str += f"  - {field}: {description}\n"

# New code to extract and format the tech expertise
tech_expertise = rick_desc_parts.get("TechExpertise", {})
tech_expertise_str = "\nTech Expertise:\n"
for field, description in tech_expertise.items():
    tech_expertise_str += f"  - {field}: {description}\n"

# New code to extract and format the interaction with developers
interaction_with_developers = rick_desc_parts.get("InteractionWithDevelopers", {})
interaction_with_developers_str = "\nInteraction With Developers:\n"
for field, description in interaction_with_developers.items():
    interaction_with_developers_str += f"  - {field}: {description}\n"

# Combine all parts into the final description
rick_desc = " ".join([
    rick_desc_parts.get("PhysicalCharacteristics", ""),
    rick_desc_parts.get("LifeHistory", ""),
    rick_desc_parts.get("PersonalityTraits", ""),
    rick_desc_parts.get("Profession", ""),
    rick_desc_parts.get("HumanPrompt", ""),
    steps_str,
    progress_tracking_str,
    collaboration_guidelines_str,
    loop_avoidance_str,
    science_expertise_str,  # Existing formatted science expertise
    legal_expertise_str,    # Added formatted legal expertise
    tech_expertise_str,     # Added formatted tech expertise
    interaction_with_developers_str  # Added formatted interaction with developers
])

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

def start_chat(user_role_name='Pete', rick_chain=None):
    manager = InteractionManager(rick_chain)

    print(f"Welcome to This Reality!, {ColorText.User}{user_role_name}{ColorText.END}\n")

    while True:
        user_input = input(f"{ColorText.User}{user_role_name}, set This topic (or 'quit' to exit): {ColorText.END}")
        if user_input.lower() == 'quit':
            print("Exiting This Reality!...")
            break

        response, responder_name = manager.get_response("User", user_input)
        print(f"{getattr(ColorText, responder_name)}{responder_name} says: {response}{ColorText.END}")

        user_input = input(f"{ColorText.User}Enter 'quit' to exit or press Enter to continue: {ColorText.END}")
        if user_input.lower() == 'quit':
            print("Exiting This Reality!...")
            break

if __name__ == "__main__":
    start_chat(rick_chain=char_chains['Rick Sanchez'])
