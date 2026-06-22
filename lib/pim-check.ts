import axios from 'axios';
import { getGraphAccessToken } from './graph-token';

export async function checkEditorPimStatus(principalId: string): Promise<{ hasWriteAccess: boolean; writeExpiresAt: string | null }> {
  const editorGroupId = process.env.EDITOR_SECURITY_GROUP_ID;
  
  if (!editorGroupId) {
    // If no PIM group is configured, fallback to old behavior
    return { hasWriteAccess: true, writeExpiresAt: null };
  }

  try {
    const accessToken = await getGraphAccessToken();
    const url = `https://graph.microsoft.com/v1.0/identityGovernance/privilegedAccess/group/assignmentScheduleInstances?$filter=groupId eq '${editorGroupId}' and principalId eq '${principalId}'`;
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const assignments = response.data.value || [];
    
    if (assignments.length > 0) {
      let latestExpiration: Date | null = null;
      for (const assignment of assignments) {
        if (assignment.endDateTime) {
          const expiration = new Date(assignment.endDateTime);
          if (!latestExpiration || expiration > latestExpiration) {
            latestExpiration = expiration;
          }
        }
      }
      return { 
        hasWriteAccess: true, 
        writeExpiresAt: latestExpiration ? latestExpiration.toISOString() : null 
      };
    }

    return { hasWriteAccess: false, writeExpiresAt: null };
  } catch (error: any) {
    console.error('PIM Check Error:', error?.response?.data || error.message);
    return { hasWriteAccess: false, writeExpiresAt: null };
  }
}

export async function checkEditorPimByUpn(upn: string): Promise<{ hasWriteAccess: boolean; writeExpiresAt: string | null }> {
  const editorGroupId = process.env.EDITOR_SECURITY_GROUP_ID;
  if (!editorGroupId) {
    return { hasWriteAccess: true, writeExpiresAt: null };
  }

  try {
    const accessToken = await getGraphAccessToken();
    
    // First, resolve UPN to ObjectId
    const userUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(upn)}?$select=id`;
    const userResponse = await axios.get(userUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    const principalId = userResponse.data.id;
    return await checkEditorPimStatus(principalId);
  } catch (error: any) {
    console.error(`PIM Check Error for UPN ${upn}:`, error?.response?.data || error.message);
    return { hasWriteAccess: false, writeExpiresAt: null };
  }
}
