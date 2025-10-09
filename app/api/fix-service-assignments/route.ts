import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic"

/**
 * This route provides a client-side fix script for service assignment ID mismatches
 * Visit this page in the browser to get the fix script and instructions
 */
export async function GET(request: NextRequest) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Fix Service Assignment IDs</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    h1 { color: #667eea; margin-top: 0; }
    h2 { color: #374151; margin-top: 30px; }
    .step {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #667eea;
    }
    .warning {
      background: #fef3c7;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #f59e0b;
      margin: 20px 0;
    }
    .success {
      background: #d1fae5;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #10b981;
      margin: 20px 0;
      display: none;
    }
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      margin: 10px 5px;
    }
    button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
    }
    code {
      background: #1f2937;
      color: #10b981;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Monaco', 'Courier New', monospace;
    }
    pre {
      background: #1f2937;
      color: #e5e7eb;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
    }
    #output {
      background: #1f2937;
      color: #e5e7eb;
      padding: 15px;
      border-radius: 6px;
      max-height: 400px;
      overflow-y: auto;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
      white-space: pre-wrap;
      display: none;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔧 Fix Service Assignment IDs</h1>
    
    <div class="warning">
      <strong>⚠️ Important:</strong> This page fixes the issue where students can't see their assigned services due to ID mismatches.
    </div>

    <div class="step">
      <h3>Step 1: Get Student Login ID</h3>
      <p>First, have the student (Jenny) log in, then click this button:</p>
      <button onclick="getStudentId()">Get Student Login ID</button>
      <p id="studentId" style="margin-top: 10px; font-weight: bold;"></p>
    </div>

    <div class="step">
      <h3>Step 2: Run the Fix</h3>
      <p>After getting the student ID above, click here to fix all service assignments:</p>
      <button onclick="runFix()" id="fixBtn" disabled>Fix Service Assignments</button>
    </div>

    <div id="output"></div>
    <div id="successMsg" class="success">
      <strong>✅ Success!</strong> Service assignments have been fixed. The student should now see their assigned services.
    </div>

    <h2>Manual Instructions</h2>
    <div class="step">
      <p>If you prefer to run the fix manually, open the browser console (F12) and paste this:</p>
      <pre>const user = JSON.parse(localStorage.getItem('demo-user') || sessionStorage.getItem('current-user') || '{}');
const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]');
const studentIndex = teamMembers.findIndex(m => m.email === user.email);

if (studentIndex >= 0 && teamMembers[studentIndex].id !== user.id) {
  const oldId = teamMembers[studentIndex].id;
  teamMembers[studentIndex].id = user.id;
  localStorage.setItem('studio-team-members', JSON.stringify(teamMembers));
  
  const assignments = JSON.parse(localStorage.getItem('service-assignments') || '[]');
  const updated = assignments.map(a => a.userId === oldId ? {...a, userId: user.id} : a);
  localStorage.setItem('service-assignments', JSON.stringify(updated));
  
  console.log('✅ Fixed! ' + updated.filter(a => a.userId === user.id && a.assigned).length + ' services now assigned');
}</pre>
    </div>
  </div>

  <script>
    let studentLoginId = null;

    function log(msg) {
      const output = document.getElementById('output');
      output.style.display = 'block';
      output.innerHTML += msg + '\\n';
      console.log(msg);
    }

    function getStudentId() {
      log('🔍 Getting current user login ID...');
      
      try {
        const demoUser = localStorage.getItem('demo-user');
        const sessionUser = sessionStorage.getItem('current-user');
        const userStr = demoUser || sessionUser;
        
        if (!userStr) {
          log('❌ No user logged in. Please log in first.');
          alert('Please log in first, then try again.');
          return;
        }
        
        const user = JSON.parse(userStr);
        studentLoginId = user.id;
        
        log('✅ Found user: ' + user.name);
        log('✅ User email: ' + user.email);
        log('✅ Login ID: ' + studentLoginId);
        log('');
        
        document.getElementById('studentId').innerHTML = 
          '✅ Student ID: <code>' + studentLoginId + '</code>';
        document.getElementById('fixBtn').disabled = false;
        
      } catch (e) {
        log('❌ Error: ' + e.message);
        alert('Error getting user ID: ' + e.message);
      }
    }

    function runFix() {
      if (!studentLoginId) {
        alert('Please get the student login ID first (Step 1)');
        return;
      }

      log('\\n🔧 Starting fix process...');
      log('==========================================');
      
      try {
        // Get team members
        const teamMembersStr = localStorage.getItem('studio-team-members');
        if (!teamMembersStr) {
          log('❌ No team members found');
          alert('No team members found in localStorage');
          return;
        }
        
        const teamMembers = JSON.parse(teamMembersStr);
        log('📋 Found ' + teamMembers.length + ' team members');
        
        // Find student by ID
        const studentIndex = teamMembers.findIndex(m => m.id === studentLoginId);
        
        if (studentIndex >= 0) {
          log('✅ Student already has correct ID');
          log('   No fix needed for team members');
        } else {
          // Find by similar email
          const user = JSON.parse(localStorage.getItem('demo-user') || sessionStorage.getItem('current-user') || '{}');
          const studentByEmail = teamMembers.findIndex(m => m.email === user.email);
          
          if (studentByEmail >= 0) {
            const oldId = teamMembers[studentByEmail].id;
            log('📝 Found student with different ID:');
            log('   Old ID: ' + oldId);
            log('   New ID: ' + studentLoginId);
            
            teamMembers[studentByEmail].id = studentLoginId;
            localStorage.setItem('studio-team-members', JSON.stringify(teamMembers));
            log('✅ Updated team member ID');
            
            // Fix assignments
            const assignmentsStr = localStorage.getItem('service-assignments');
            if (assignmentsStr) {
              const assignments = JSON.parse(assignmentsStr);
              log('📋 Found ' + assignments.length + ' total assignments');
              
              const oldAssignments = assignments.filter(a => a.userId === oldId);
              log('   ' + oldAssignments.length + ' assignments with old ID');
              
              const updatedAssignments = assignments.map(a => {
                if (a.userId === oldId) {
                  return { ...a, userId: studentLoginId };
                }
                return a;
              });
              
              localStorage.setItem('service-assignments', JSON.stringify(updatedAssignments));
              
              const studentAssignments = updatedAssignments.filter(
                a => a.userId === studentLoginId && a.assigned
              );
              
              log('✅ Updated service assignments');
              log('✅ Student now has ' + studentAssignments.length + ' services assigned');
              log('');
              log('==========================================');
              log('🎉 FIX COMPLETE!');
              log('');
              log('The student should now:');
              log('1. Refresh their browser');
              log('2. Go to Studio → Supervision Booking');
              log('3. They will see their assigned services');
              
              document.getElementById('successMsg').style.display = 'block';
              alert('✅ Fix complete! ' + studentAssignments.length + ' services now assigned to the student.');
            }
          } else {
            log('❌ Student not found in team members');
            alert('Student not found. Please add them to the team first.');
          }
        }
        
      } catch (e) {
        log('❌ Error: ' + e.message);
        alert('Error during fix: ' + e.message);
      }
    }
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}


