targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment (used for resource naming)')
param environmentName string

@minLength(1)
@description('Azure region for all resources')
param location string = 'koreacentral'

@description('OpenAI API key stored in App Service settings')
@secure()
param openAiApiKey string = ''

@description('Azure OpenAI endpoint. Leave empty to use OPENAI_API_KEY fallback.')
param azureOpenAiEndpoint string = ''

@description('Azure OpenAI API key. Leave empty to use OPENAI_API_KEY fallback.')
@secure()
param azureOpenAiApiKey string = ''

@description('Azure OpenAI model deployment name. Leave empty to use OPENAI_API_KEY fallback.')
param azureOpenAiDeploymentName string = ''

@description('Azure OpenAI API version')
param azureOpenAiApiVersion string = '2024-10-21'

var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'rg-${environmentName}'
  location: location
  tags: tags
}

module appService 'app-service.bicep' = {
  name: 'appservice'
  scope: rg
  params: {
    location: location
    tags: tags
    resourceToken: resourceToken
    openAiApiKey: openAiApiKey
    azureOpenAiEndpoint: azureOpenAiEndpoint
    azureOpenAiApiKey: azureOpenAiApiKey
    azureOpenAiDeploymentName: azureOpenAiDeploymentName
    azureOpenAiApiVersion: azureOpenAiApiVersion
  }
}

output AZURE_LOCATION string = location
output SERVICE_WEB_URI string = appService.outputs.SERVICE_WEB_URI
output APPLICATIONINSIGHTS_NAME string = appService.outputs.APPLICATIONINSIGHTS_NAME
output LOG_ANALYTICS_WORKSPACE_NAME string = appService.outputs.LOG_ANALYTICS_WORKSPACE_NAME
