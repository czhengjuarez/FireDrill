// CyberSecure Deck Game Data
export const roles = [
  {
    id: 'communications',
    name: 'Communications/Media',
    description: 'Manages internal and external communications, media relations, and public messaging during incidents.',
    color: 'bg-blue-500',
    icon: 'megaphone'
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Oversees financial impact assessment, budget allocation for incident response, and financial recovery.',
    color: 'bg-green-500',
    icon: 'currency'
  },
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'Handles employee communications, training, and workforce management during security incidents.',
    color: 'bg-purple-500',
    icon: 'users'
  },
  {
    id: 'it',
    name: 'Information Technology',
    description: 'Manages technical infrastructure, system recovery, and IT security measures.',
    color: 'bg-indigo-500',
    icon: 'laptop'
  },
  {
    id: 'leader',
    name: 'Leader',
    description: 'Provides executive oversight, makes strategic decisions, and coordinates organizational response.',
    color: 'bg-red-500',
    icon: 'crown'
  },
  {
    id: 'legal',
    name: 'Legal/Risk/Compliance',
    description: 'Ensures regulatory compliance, manages legal implications, and assesses organizational risk.',
    color: 'bg-yellow-500',
    icon: 'scale'
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Maintains business continuity, manages operational processes during incidents.',
    color: 'bg-orange-500',
    icon: 'cog'
  },
  {
    id: 'security',
    name: 'Security/Law Enforcement',
    description: 'Leads incident response, coordinates with law enforcement, and implements security measures.',
    color: 'bg-gray-700',
    icon: 'shield'
  }
];

export const scenarios = [
  {
    id: 'phishing',
    name: 'Phishing Attack',
    description: 'A sophisticated phishing campaign targeting your organization\'s employees with credential harvesting attempts.',
    severity: 'High',
    estimatedTime: '60 minutes',
    objectives: [
      'Identify the scope of the phishing attack',
      'Protect remaining systems and users',
      'Detect compromised accounts',
      'Respond to the incident effectively',
      'Recover and strengthen defenses'
    ]
  },
  {
    id: 'malware',
    name: 'Malware Infection',
    description: 'Ransomware has been detected on multiple systems across your organization.',
    severity: 'Critical',
    estimatedTime: '75 minutes',
    objectives: [
      'Contain the malware spread',
      'Assess system damage',
      'Coordinate recovery efforts',
      'Communicate with stakeholders',
      'Implement lessons learned'
    ]
  },
  {
    id: 'insider_threat',
    name: 'Insider Threat',
    description: 'Suspicious activity suggests a potential insider threat with unauthorized data access.',
    severity: 'High',
    estimatedTime: '45 minutes',
    objectives: [
      'Investigate suspicious behavior',
      'Protect sensitive information',
      'Coordinate with HR and Legal',
      'Maintain operational security',
      'Document findings'
    ]
  },
  {
    id: 'social_engineering',
    name: 'Social Engineering',
    description: 'Attackers are using social engineering tactics to gain unauthorized access to systems.',
    severity: 'Medium',
    estimatedTime: '30 minutes',
    objectives: [
      'Identify attack vectors',
      'Educate affected personnel',
      'Strengthen security awareness',
      'Monitor for further attempts',
      'Update security protocols'
    ]
  },
  {
    id: 'business_continuity',
    name: 'Business Continuity Crisis',
    description: 'A major system outage threatens business operations and customer services.',
    severity: 'Critical',
    estimatedTime: '90 minutes',
    objectives: [
      'Activate continuity plans',
      'Maintain critical operations',
      'Communicate with customers',
      'Coordinate recovery efforts',
      'Minimize business impact'
    ]
  },
  {
    id: 'unauthorized_downloads',
    name: 'Unauthorized Downloads',
    description: 'Employees are downloading and using unauthorized software, creating security vulnerabilities.',
    severity: 'Medium',
    estimatedTime: '45 minutes',
    objectives: [
      'Identify unauthorized software usage',
      'Assess security risks and vulnerabilities',
      'Implement policy enforcement',
      'Educate employees on approved software',
      'Strengthen endpoint security controls'
    ]
  }
];

export const injectCards = {
  phishing: [
    {
      id: 'phishing_1',
      targetRole: 'it',
      title: 'Suspicious Email Reports',
      content: 'Multiple employees have reported receiving suspicious emails claiming to be from the CEO requesting urgent wire transfers. The emails contain links to what appears to be a company login page.',
      urgency: 'high',
      timestamp: '09:15 AM'
    },
    {
      id: 'phishing_2',
      targetRole: 'security',
      title: 'Security Alert Triggered',
      content: 'Your security monitoring system has detected unusual login attempts from multiple IP addresses using employee credentials. Several accounts show signs of compromise.',
      urgency: 'critical',
      timestamp: '09:30 AM'
    },
    {
      id: 'phishing_3',
      targetRole: 'hr',
      title: 'Employee Concerns',
      content: 'Several employees are calling HR asking if the CEO really sent emails requesting personal information and financial transfers. They seem confused and worried.',
      urgency: 'medium',
      timestamp: '09:45 AM'
    },
    {
      id: 'phishing_4',
      targetRole: 'communications',
      title: 'Media Inquiry',
      content: 'A local news reporter has called asking about reports of a "security breach" at your company. They claim to have received a tip from someone claiming to be an employee.',
      urgency: 'high',
      timestamp: '10:00 AM'
    },
    {
      id: 'phishing_5',
      targetRole: 'finance',
      title: 'Unauthorized Transaction Attempt',
      content: 'The bank has called to verify a large wire transfer request that was submitted online using executive credentials. The transaction seems unusual for your organization.',
      urgency: 'critical',
      timestamp: '10:15 AM'
    },
    {
      id: 'phishing_6',
      targetRole: 'legal',
      title: 'Regulatory Notification Requirements',
      content: 'You need to determine if this incident requires notification to regulators, law enforcement, or affected customers within specific timeframes.',
      urgency: 'high',
      timestamp: '10:30 AM'
    }
  ],
  malware: [
    {
      id: 'malware_1',
      targetRole: 'it',
      title: 'System Encryption Detected',
      content: 'Multiple workstations are displaying ransomware messages. File servers are showing encrypted files with .locked extensions. Systems are becoming inaccessible.',
      urgency: 'critical',
      timestamp: '08:00 AM'
    },
    {
      id: 'malware_2',
      targetRole: 'operations',
      title: 'Production Systems Down',
      content: 'Critical production systems have stopped responding. Manufacturing equipment is offline and customer service systems are inaccessible.',
      urgency: 'critical',
      timestamp: '08:15 AM'
    },
    {
      id: 'malware_3',
      targetRole: 'security',
      title: 'Ransom Demand',
      content: 'A ransom note has appeared demanding 50 Bitcoin payment within 72 hours. The attackers claim to have exfiltrated sensitive customer data.',
      urgency: 'critical',
      timestamp: '08:30 AM'
    },
    {
      id: 'malware_4',
      targetRole: 'leader',
      title: 'Executive Decision Required',
      content: 'The incident response team needs executive guidance on whether to pay the ransom, how to communicate with stakeholders, and resource allocation for recovery.',
      urgency: 'critical',
      timestamp: '08:45 AM'
    }
  ],
  insider_threat: [
    {
      id: 'insider_1',
      targetRole: 'security',
      title: 'Unusual Access Patterns',
      content: 'Security logs show an employee accessing sensitive files outside their normal job responsibilities, including customer databases and financial records, during off-hours.',
      urgency: 'high',
      timestamp: '07:30 AM'
    },
    {
      id: 'insider_2',
      targetRole: 'hr',
      title: 'Employee Performance Issues',
      content: 'The employee in question recently received a negative performance review and has been expressing dissatisfaction with management decisions.',
      urgency: 'medium',
      timestamp: '08:00 AM'
    },
    {
      id: 'insider_3',
      targetRole: 'it',
      title: 'Data Transfer Alert',
      content: 'Large amounts of data have been transferred to external storage devices and cloud services from the suspect employee\'s workstation.',
      urgency: 'high',
      timestamp: '08:15 AM'
    },
    {
      id: 'insider_4',
      targetRole: 'legal',
      title: 'Investigation Protocols',
      content: 'Legal guidance is needed on conducting an internal investigation while preserving evidence and protecting employee rights.',
      urgency: 'high',
      timestamp: '08:30 AM'
    }
  ],
  social_engineering: [
    {
      id: 'social_1',
      targetRole: 'communications',
      title: 'Impersonation Calls',
      content: 'Multiple departments report receiving calls from someone claiming to be from IT support, requesting passwords and system access for "urgent maintenance."',
      urgency: 'high',
      timestamp: '11:00 AM'
    },
    {
      id: 'social_2',
      targetRole: 'hr',
      title: 'Fake Employee Verification',
      content: 'Someone called HR claiming to be from a background check company, requesting employee personal information for "verification purposes."',
      urgency: 'medium',
      timestamp: '11:30 AM'
    },
    {
      id: 'social_3',
      targetRole: 'security',
      title: 'Physical Security Breach',
      content: 'Security cameras show an unauthorized person who gained access to the building by following employees and claiming to be a new contractor.',
      urgency: 'high',
      timestamp: '12:00 PM'
    }
  ],
  business_continuity: [
    {
      id: 'bc_1',
      targetRole: 'it',
      title: 'Data Center Outage',
      content: 'The primary data center has experienced a complete power failure. Backup generators failed to start, and all systems are offline.',
      urgency: 'critical',
      timestamp: '14:00 PM'
    },
    {
      id: 'bc_2',
      targetRole: 'operations',
      title: 'Customer Service Impact',
      content: 'Customer service systems are down. Call centers cannot access customer records, and the company website is inaccessible.',
      urgency: 'critical',
      timestamp: '14:15 PM'
    },
    {
      id: 'bc_3',
      targetRole: 'communications',
      title: 'Customer Communications',
      content: 'Customers are posting complaints on social media about service outages. Local news is starting to pick up the story.',
      urgency: 'high',
      timestamp: '14:30 PM'
    },
    {
      id: 'bc_4',
      targetRole: 'finance',
      title: 'Financial Impact Assessment',
      content: 'Each hour of downtime is costing approximately $100,000 in lost revenue. Payment processing systems are also affected.',
      urgency: 'high',
      timestamp: '14:45 PM'
    },
    {
      id: 'bc_5',
      targetRole: 'leader',
      title: 'Executive Decision Required',
      content: 'The board of directors is demanding updates. Customers are threatening to switch providers. A decision is needed on activating the disaster recovery site.',
      urgency: 'critical',
      timestamp: '15:00 PM'
    },
    {
      id: 'bc_6',
      targetRole: 'hr',
      title: 'Employee Coordination',
      content: 'Remote employees cannot access systems to work. Some departments want to send staff home. Others need emergency staffing for manual processes.',
      urgency: 'high',
      timestamp: '15:15 PM'
    },
    {
      id: 'bc_7',
      targetRole: 'legal',
      title: 'Regulatory Compliance Concerns',
      content: 'The outage may violate SLA agreements with major clients. Regulatory reporting deadlines are at risk. Legal implications of the extended downtime need assessment.',
      urgency: 'high',
      timestamp: '15:30 PM'
    },
    {
      id: 'bc_8',
      targetRole: 'security',
      title: 'Security During Recovery',
      content: 'As systems come back online, security controls need verification. There are concerns about data integrity and potential security compromises during the outage.',
      urgency: 'high',
      timestamp: '15:45 PM'
    }
  ],
  unauthorized_downloads: [
    {
      id: 'ud_1',
      targetRole: 'it',
      title: 'Unauthorized Software Detection',
      content: 'Network monitoring has detected multiple instances of unauthorized software installations, including file-sharing applications, games, and productivity tools not approved by IT.',
      urgency: 'medium',
      timestamp: '09:00 AM'
    },
    {
      id: 'ud_2',
      targetRole: 'security',
      title: 'Malware Risk Assessment',
      content: 'Security scans reveal that some unauthorized downloads contain malware. Several workstations show signs of infection, and network traffic indicates potential data exfiltration.',
      urgency: 'high',
      timestamp: '09:30 AM'
    },
    {
      id: 'ud_3',
      targetRole: 'hr',
      title: 'Employee Policy Violations',
      content: 'Multiple employees across different departments have violated the acceptable use policy. Some claim they needed the software for work, others downloaded personal applications.',
      urgency: 'medium',
      timestamp: '10:00 AM'
    },
    {
      id: 'ud_4',
      targetRole: 'legal',
      title: 'Licensing and Compliance Issues',
      content: 'Unlicensed software usage may violate copyright laws and software licensing agreements. The organization could face legal action and significant fines.',
      urgency: 'high',
      timestamp: '10:30 AM'
    },
    {
      id: 'ud_5',
      targetRole: 'operations',
      title: 'System Performance Impact',
      content: 'Unauthorized applications are consuming significant network bandwidth and system resources, causing slowdowns in critical business applications.',
      urgency: 'medium',
      timestamp: '11:00 AM'
    },
    {
      id: 'ud_6',
      targetRole: 'finance',
      title: 'Budget and Cost Implications',
      content: 'The organization may need to purchase legitimate licenses for software already in use. Additionally, remediation costs and potential fines need budget consideration.',
      urgency: 'medium',
      timestamp: '11:30 AM'
    },
    {
      id: 'ud_7',
      targetRole: 'communications',
      title: 'Internal Communication Strategy',
      content: 'Employees need to be informed about the policy violations and new security measures. A communication plan is needed to address concerns and prevent future incidents.',
      urgency: 'medium',
      timestamp: '12:00 PM'
    },
    {
      id: 'ud_8',
      targetRole: 'leader',
      title: 'Policy Enforcement Decision',
      content: 'Executive decision needed on disciplinary actions, policy updates, and investment in approved software alternatives to meet employee needs while maintaining security.',
      urgency: 'high',
      timestamp: '12:30 PM'
    }
  ]
};

export const nistFramework = {
  identify: {
    name: 'Identify',
    description: 'Understand cybersecurity risks to systems, assets, data, and capabilities',
    color: 'bg-blue-600'
  },
  protect: {
    name: 'Protect',
    description: 'Implement safeguards to ensure delivery of critical services',
    color: 'bg-green-600'
  },
  detect: {
    name: 'Detect',
    description: 'Implement activities to identify cybersecurity events',
    color: 'bg-yellow-600'
  },
  respond: {
    name: 'Respond',
    description: 'Take action regarding detected cybersecurity incidents',
    color: 'bg-orange-600'
  },
  recover: {
    name: 'Recover',
    description: 'Maintain resilience and restore capabilities impaired by incidents',
    color: 'bg-purple-600'
  }
};
