const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://pmu-eiidx4ttn-tyronejackboy-9924s-projects.vercel.app';

async function analyzeMobileEnhancement() {
  console.log('📱 MOBILE ENHANCEMENT ANALYSIS');
  console.log('=============================');
  console.log(`🌐 Testing URL: ${BASE_URL}`);
  console.log('');

  const pages = [
    { name: 'Dashboard', url: '/dashboard', priority: 'HIGH' },
    { name: 'Features', url: '/features', priority: 'HIGH' },
    { name: 'Clients', url: '/clients', priority: 'HIGH' },
    { name: 'Services', url: '/services', priority: 'HIGH' },
    { name: 'Booking', url: '/booking', priority: 'HIGH' },
    { name: 'POS', url: '/pos', priority: 'HIGH' },
    { name: 'Settings', url: '/settings', priority: 'MEDIUM' },
    { name: 'Billing', url: '/billing', priority: 'MEDIUM' },
    { name: 'Pricing', url: '/pricing', priority: 'MEDIUM' },
    { name: 'Inventory', url: '/inventory', priority: 'MEDIUM' },
    { name: 'Expenses', url: '/expenses', priority: 'MEDIUM' },
    { name: 'Payouts', url: '/payouts', priority: 'MEDIUM' },
    { name: 'Referrals', url: '/referrals', priority: 'MEDIUM' },
    { name: 'Skin Analysis', url: '/analyze', priority: 'HIGH' },
    { name: 'Pigment Library', url: '/pigment-library', priority: 'MEDIUM' },
    { name: 'Aftercare', url: '/aftercare', priority: 'MEDIUM' },
    { name: 'Portfolio', url: '/portfolio', priority: 'MEDIUM' },
    { name: 'Calendar Integration', url: '/integrations/calendar', priority: 'LOW' },
    { name: 'Meta Integration', url: '/integrations/meta', priority: 'LOW' },
    { name: 'Team Management', url: '/enterprise/staff', priority: 'LOW' },
  ];

  const mobileIssues = [];
  const enhancementRecommendations = [];

  console.log('🔍 ANALYZING MOBILE RESPONSIVENESS');
  console.log('==================================');

  for (const page of pages) {
    try {
      const response = await fetch(`${BASE_URL}${page.url}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        }
      });
      const html = await response.text();
      
      // Analyze mobile responsiveness
      const analysis = analyzeMobileResponsiveness(html, page.name);
      
      if (analysis.score < 70) {
        mobileIssues.push({
          page: page.name,
          url: page.url,
          priority: page.priority,
          score: analysis.score,
          issues: analysis.issues,
          recommendations: analysis.recommendations
        });
      }

      console.log(`${analysis.score >= 70 ? '✅' : '⚠️'} ${page.name}: ${analysis.score}% mobile optimized`);
      
    } catch (error) {
      console.log(`❌ ${page.name}: ERROR - ${error.message}`);
    }
  }

  console.log('');
  console.log('📋 MOBILE ENHANCEMENT RECOMMENDATIONS');
  console.log('=====================================');

  // Sort by priority and score
  mobileIssues.sort((a, b) => {
    const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return a.score - b.score;
  });

  mobileIssues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.page} (${issue.priority} Priority)`);
    console.log(`   URL: ${issue.url}`);
    console.log(`   Mobile Score: ${issue.score}%`);
    console.log(`   Issues:`);
    issue.issues.forEach(problem => {
      console.log(`   - ${problem}`);
    });
    console.log(`   Recommendations:`);
    issue.recommendations.forEach(rec => {
      console.log(`   - ${rec}`);
    });
  });

  console.log('');
  console.log('🎯 TOP PRIORITY MOBILE ENHANCEMENTS');
  console.log('===================================');

  const highPriorityIssues = mobileIssues.filter(issue => issue.priority === 'HIGH');
  if (highPriorityIssues.length > 0) {
    console.log('🚨 HIGH PRIORITY (Critical for user experience):');
    highPriorityIssues.slice(0, 5).forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.page} - Score: ${issue.score}%`);
    });
  }

  const mediumPriorityIssues = mobileIssues.filter(issue => issue.priority === 'MEDIUM');
  if (mediumPriorityIssues.length > 0) {
    console.log('\n⚠️  MEDIUM PRIORITY (Important for business operations):');
    mediumPriorityIssues.slice(0, 5).forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.page} - Score: ${issue.score}%`);
    });
  }

  console.log('');
  console.log('📊 SUMMARY');
  console.log('==========');
  console.log(`Total pages analyzed: ${pages.length}`);
  console.log(`Pages needing enhancement: ${mobileIssues.length}`);
  console.log(`High priority enhancements: ${highPriorityIssues.length}`);
  console.log(`Medium priority enhancements: ${mediumPriorityIssues.length}`);
  console.log(`Low priority enhancements: ${mobileIssues.filter(issue => issue.priority === 'LOW').length}`);

  if (mobileIssues.length === 0) {
    console.log('\n🎉 All pages are well optimized for mobile!');
  } else {
    console.log(`\n🔧 Focus on the top ${Math.min(5, highPriorityIssues.length)} high-priority pages first.`);
  }
}

function analyzeMobileResponsiveness(html, pageName) {
  let score = 100;
  const issues = [];
  const recommendations = [];

  // Check for responsive grid classes
  if (!html.includes('grid-cols-') || !html.includes('sm:grid-cols-')) {
    score -= 15;
    issues.push('Missing responsive grid system');
    recommendations.push('Add responsive grid classes (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3)');
  }

  // Check for responsive flexbox
  if (!html.includes('flex-col') || !html.includes('sm:flex-row')) {
    score -= 10;
    issues.push('Limited responsive flexbox usage');
    recommendations.push('Add responsive flex classes (flex-col sm:flex-row)');
  }

  // Check for responsive text sizing
  if (!html.includes('text-sm') || !html.includes('text-lg')) {
    score -= 10;
    issues.push('Missing responsive text sizing');
    recommendations.push('Add responsive text classes (text-sm sm:text-base lg:text-lg)');
  }

  // Check for responsive spacing
  if (!html.includes('p-4') || !html.includes('sm:p-6')) {
    score -= 10;
    issues.push('Limited responsive spacing');
    recommendations.push('Add responsive padding/margin classes');
  }

  // Check for mobile-specific button handling
  if (!html.includes('w-full sm:w-auto') && !html.includes('w-full')) {
    score -= 15;
    issues.push('Buttons may not be mobile-friendly');
    recommendations.push('Add responsive button widths (w-full sm:w-auto)');
  }

  // Check for responsive images
  if (html.includes('<img') && !html.includes('object-contain') && !html.includes('object-cover')) {
    score -= 10;
    issues.push('Images may not be responsive');
    recommendations.push('Add responsive image classes (object-contain, object-cover)');
  }

  // Check for responsive forms
  if (html.includes('<input') && !html.includes('w-full')) {
    score -= 10;
    issues.push('Form inputs may not be mobile-friendly');
    recommendations.push('Add w-full class to form inputs');
  }

  // Check for responsive cards
  if (html.includes('Card') && !html.includes('p-4') && !html.includes('p-6')) {
    score -= 10;
    issues.push('Cards may not have proper mobile padding');
    recommendations.push('Add responsive padding to cards');
  }

  // Check for responsive navigation
  if (html.includes('nav') && !html.includes('hidden') && !html.includes('sm:flex')) {
    score -= 10;
    issues.push('Navigation may not be mobile-responsive');
    recommendations.push('Add responsive navigation classes (hidden sm:flex)');
  }

  // Check for responsive tables
  if (html.includes('<table') && !html.includes('overflow-x-auto')) {
    score -= 10;
    issues.push('Tables may overflow on mobile');
    recommendations.push('Add overflow-x-auto to tables');
  }

  // Page-specific checks
  if (pageName === 'Dashboard') {
    if (!html.includes('lg:hidden') || !html.includes('hidden lg:grid')) {
      score -= 15;
      issues.push('Dashboard layout not optimized for mobile');
      recommendations.push('Add mobile-specific dashboard layout');
    }
  }

  if (pageName === 'Features') {
    if (!html.includes('grid-cols-2') || !html.includes('grid-cols-4')) {
      score -= 15;
      issues.push('Features grid not responsive');
      recommendations.push('Add responsive grid for features (grid-cols-2 sm:grid-cols-4)');
    }
  }

  if (pageName === 'Clients') {
    if (!html.includes('truncate') || !html.includes('flex-col sm:flex-row')) {
      score -= 15;
      issues.push('Client cards not mobile-optimized');
      recommendations.push('Add truncate and responsive flex to client cards');
    }
  }

  if (pageName === 'Settings') {
    if (!html.includes('space-y-4') || !html.includes('grid-cols-1 md:grid-cols-2')) {
      score -= 15;
      issues.push('Settings form not mobile-responsive');
      recommendations.push('Add responsive form layout');
    }
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

// Run the analysis
analyzeMobileEnhancement()
  .then(() => {
    console.log('\n✅ Mobile enhancement analysis completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Mobile enhancement analysis failed:', error);
    process.exit(1);
  });





