/* 
Bounty fields
{
    name: null,
    description: null,
    links: [''],
    requiresApplication: false,
    voting: false,
    publicSubmissions: false,
    externalFunding: true,
    showContributors: true,
    forAddresses: [],
    deadline: null,
    gnosis: undefined,
    applicationsDeadline: null,
    votingStart: null,
    votingEnd: null,
    votingNFT: null,
    tokenAmount: null
}
*/
const bullets = "\n\n*\n*\n*\n\n";
const todolist = "To claim the token rewards, complete the following:" + bullets;

export default [
    // {
    //     // appears on the template page
    //     template_category: 'product',
    //     template: 'SDK Development',
    //     template_description: 'Use this template to specify a front end SDK for your Protocol.',

    //     // appears in the bounty
    //     name: 'Build an SDK for Our Protocol',
    //     description: 'Build a React based SDK for our protocol.' + todolist,
    // },
    // {
    //     template_category: 'product',
    //     template: 'Analytics Dashboard',
    //     template_description: 'A great first bounty for data analysts in your community.',
        
    //     name: 'Build an Analytics Dashboard for our protocol',
    //     description: 'Create a Analytics Dashboard for our protocol. The dashboard should contain the following reports:' + bullets+"Please include a link in your claim.",
    // },
    // {
    //     template_category: 'product',
    //     template_description: 'A great way to users to help each other by documenting your app or protocol.',
    //     template: 'Software Documentation',
    //     name: 'Write Documentation for our newest features.',
    //     description: 'We need documentation for some of our newest features'+bullets+'Write some documentation and Link to the Notion or Google Doc below. ',
    // },

    // GENERAL 
    // {
    //     template_category: 'general',
    //     template: 'Hiring Referrals',
    //     template_description: "Hire your next role with a community referral. Works well when you have a large audience on social media.",

    //     publicSubmissions: false,
    //     name: 'Find a Candidate',
    //     description: 'Help us Find a candidate for this position. All successful referrals will be rewarded once the bounty is completed.',
    // },
    // {
    //     template_category: 'general',
    //     template: 'Translation / Proofreading',
    //     template_description: "Translate or Proofread a documentation or a part of your software ",

    //     name: 'Translation for [X]',
    //     description: 'Help us translate [X] into the following languages:'+bullets+"Please submit translated docs via Google Doc, or Crowdin.",
    //     externalFunding: false,
    // },
    
    // MARKETING 
    // {
    //     template_category: 'marketing',
    //     template: 'Write An Article',
    //     template_description: "Get your community to write an article about your protocol or project",

    //     name: 'Write a Blog Post about [Project]',
    //     description: 'The blog post should be:'+bullets+"Rewards will be paid when published. Please include a link in your claim.",
    // },    
    // {
    //     template_category: 'marketing',
    //     template: 'Create a Video',
    //     template_description: "Get your community to create a video about your protocol or project",

    //     name: 'Create a Video about [Project]',
    //     description: 'The video should be:'+bullets+"Rewards will be paid when published. Please include a link in your claim.",
    // },    

    // ,    
    // {
    //     template_category: 'marketing',
    //     template: 'Create a Podcast Episode',
    //     template_description: "Get your community to create a podcast episode about your protocol or project",

    //     name: 'Create a Podcast about [Project]',
    //     description: 'The podcast should be:'+bullets+"Rewards will be paid when published. Please include a link in your claim.",
    // },  

    // FORMATS
    {
        template_category: 'format',
        template: 'Fixed Scope Bounty',
        template_description: "Use this simple template to create a list of tasks that you need completed by your community.",

        name: 'Fixed Scope Bounty',
        description: todolist,
        externalFunding: false,
    },
    {
        template_category: 'format',
        template: 'Fixed Scope Bounty with Application',
        template_description: "Use this simple template to create a simple application process before people can claim your bounty.",

        name: 'Fixed Scope Bounty',
        description: todolist+"This task requires an application before claiming a bounty. Click Apply to continue, and when you get approved, you will get notified via email.",
        requiresApplication: true,
    },
    {
        template_category: 'format',
        template: 'Retroactive Work',
        template_description: 'Use this template when you want to reward already completed work.',
        name: 'Retroactive Bounty for [Specify name or Scope Here]',
        description: 'This is a retroactive reward for [Name] for completing work as specified below.\n\n*',
        publicSubmissions: false,
        externalFunding: false,
    },
    {
        template_category: 'format',
        template: 'Fundable Bounty',
        template_description: 'A great way to invite contributions with time OR tokens.',
        
        name: 'Fundable Bounty',
        description: todolist + "If you would like to contribute tokens towards this bounty, click Add Funds",
        publicSubmissions: true,
        externalFunding: true,
    },

    // GRANTS
    {
        template_category: 'grants',
        template: 'Grants with Private Submissions',
        template_description: 'Create a micro grant round with private submissions.',

        name: '[Project Name] Grants Round',
        description: 'This is an open grant for the builders in our community. The best ideas will get funded based on the following criteria:'+bullets+"We're looking for projects in the focused on the following areas:"+bullets,
        publicSubmissions: false,
        externalFunding: false,
    },
    {
        template_category: 'grants',
        template: 'Grants with Public Submissions',
        template_description: 'A micro grant round with public submissions, useful for public goods oriented funding. Also enables others to fund the round.',

        name: '[Project Name] Grants Round',
        description: 'This is an open grant for the builders in our community. The best ideas will get funded based on the following criteria:'+bullets+"We're looking for projects in the focused on the following areas:"+bullets,
        publicSubmissions: true,
        externalFunding: false,
    },
    {
        template_category: 'grants',
        template: 'Community Voted Grants',
        template_description: 'Similar to Nouns Prop House, a Community voted grant round has public submissions with voting enabled.',

        name: 'Prop.House Style Grants',
        description: 'This is an open grant for the builders in our community. The best ideas will get funded based on the following criteria:'+bullets+"We're looking for projects in the focused on the following areas:"+bullets,
        voting: true,
        externalFunding: false
    },
]