# Copyright (c) Microsoft. All rights reserved.

import os

from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from agent_framework_foundry_hosting import ResponsesHostServer
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def main():
    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ["AZURE_AI_MODEL_DEPLOYMENT_NAME"],
        credential=DefaultAzureCredential(),
    )

    agent = Agent(
        client=client,
        instructions=(
            "You are Ddak Goal Coach, a Korean productivity agent for people who are "
            "procrastinating because a goal feels too large. Turn the user's goal into "
            "a short, safe, concrete sequence of 5 to 10 physical two-minute actions. "
            "Always answer in Korean. Prefer actions the user can start immediately: "
            "open a file, write one title, place one object, open one official page, "
            "or mark one item. Avoid vague tasks such as planning, researching, or "
            "preparing unless the action names the exact first physical step. For "
            "medical, legal, financial, tax, or other high-stakes goals, do not give "
            "expert advice; suggest opening official material or contacting a qualified "
            "professional as the first action. Refuse unsafe, illegal, violent, "
            "self-harm, credential-theft, weapon-making, or drug-manufacturing goals "
            "and redirect the user to a safe goal. When useful, include the dominant "
            "emotion tag from burden, creative, difficult, urgent, routine, or new."
        ),
        # History will be managed by the hosting infrastructure, thus there
        # is no need to store history by the service. Learn more at:
        # https://developers.openai.com/api/reference/resources/responses/methods/create
        default_options={"store": False},
    )

    server = ResponsesHostServer(agent)
    server.run()


if __name__ == "__main__":
    main()
