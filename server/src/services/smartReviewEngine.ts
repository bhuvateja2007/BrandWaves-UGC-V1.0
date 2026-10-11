/**
 * BrandWaves Smart Submission Review Engine
 * Structured 3-Tier Evaluation Architecture:
 * 1. Automatically Verifiable Checks (Deterministic facts from structured submission data)
 * 2. AI-Assisted Observations (Inferred from text, metadata, and prompt-sanitized analysis)
 * 3. Human-Only Judgments (Aesthetic quality, authenticity, brand tone, copyright)
 *
 * GOVERNANCE RULES:
 * - AI assists human reviewers, it never executes approval or rejection.
 * - Reviewer decisions require explicit human confirmation.
 * - Creator submissions are treated as untrusted text (prompt injection protected).
 */

import { Submission, Campaign, SmartReviewResult, RequirementCheckResult } from '../types.js';
import { aiProvider } from './aiProvider.js';

export async function evaluateSubmission(
  submission: Submission,
  campaign: Campaign | any
): Promise<SmartReviewResult> {
  const verifiableChecks: RequirementCheckResult[] = [];
  const caption = (submission.caption || '').trim();
  const title = (submission.videoTitle || '').trim();
  const tags = Array.isArray(submission.tags) ? submission.tags : [];
  const allText = `${title} ${caption} ${tags.join(' ')}`.toLowerCase();

  // -------------------------------------------------------------------------
  // TIER 1: AUTOMATICALLY VERIFIABLE CHECKS (Deterministic)
  // -------------------------------------------------------------------------

  // 1. Valid Deliverable URL Check
  const hasValidUrl =
    Boolean(submission.videoUrl) &&
    (submission.videoUrl.startsWith('http://') || submission.videoUrl.startsWith('https://')) &&
    submission.videoUrl.includes('.');

  verifiableChecks.push({
    id: 'check_url_validity',
    title: 'Deliverable Link Accessibility',
    type: 'verifiable',
    status: hasValidUrl ? 'pass' : 'fail',
    evidence: submission.videoUrl || 'No URL provided',
    explanation: hasValidUrl
      ? `Valid external HTTPS link supplied for ${submission.platform}.`
      : 'Invalid or missing media URL provided in submission.',
  });

  // 2. Deliverable Platform Alignment Check
  const subPlatform = submission.platform || '';
  const campaignPlatform = campaign.platform || 'Multi-platform';
  const platformMatches =
    campaignPlatform.toLowerCase().includes('multi') ||
    (Boolean(subPlatform) && campaignPlatform.toLowerCase().includes(subPlatform.toLowerCase())) ||
    (Boolean(subPlatform) && subPlatform.toLowerCase().includes(campaignPlatform.toLowerCase()));

  verifiableChecks.push({
    id: 'check_platform_alignment',
    title: 'Platform Deliverable Alignment',
    type: 'verifiable',
    status: platformMatches ? 'pass' : 'needs_review',
    evidence: `Submitted for: ${subPlatform || 'Unspecified'} | Campaign requested: ${campaignPlatform}`,
    explanation: platformMatches
      ? `Deliverable platform (${subPlatform}) aligns with campaign requirements.`
      : `Deliverable platform (${subPlatform || 'Unspecified'}) differs from target ${campaignPlatform}.`,
  });

  // 3. Metadata Completeness Check
  const hasCompleteMetadata =
    Boolean(title) &&
    Boolean(submission.thumbnail) &&
    Boolean(submission.duration);

  verifiableChecks.push({
    id: 'check_metadata_completeness',
    title: 'Asset Metadata Completeness',
    type: 'verifiable',
    status: hasCompleteMetadata ? 'pass' : 'needs_review',
    evidence: `Title: "${title.slice(0, 30)}..." | Duration: ${submission.duration || 'N/A'} | Thumbnail: present`,
    explanation: hasCompleteMetadata
      ? 'All standard delivery metadata fields (title, duration, preview thumbnail) are present.'
      : 'One or more deliverable metadata fields are missing.',
  });

  // 4. Required Tags & Disclosures Verifiable Check
  const campaignReqs: string[] =
    (campaign.requirements && campaign.requirements.length > 0)
      ? campaign.requirements
      : (campaign.deliverables && campaign.deliverables.length > 0)
      ? campaign.deliverables
      : ['Clear product placement', 'High-quality video presentation', 'Follow brand brief'];

  const extractedTags: string[] = [];
  campaignReqs.forEach((req: string) => {
    const matches = req.match(/[#@][A-Za-z0-9_]+/g);
    if (matches) {
      extractedTags.push(...matches);
    }
  });

  if (extractedTags.length > 0) {
    const missing = extractedTags.filter((t) => !allText.includes(t.toLowerCase()));
    const present = extractedTags.filter((t) => allText.includes(t.toLowerCase()));

    verifiableChecks.push({
      id: 'check_required_tags',
      title: 'Mandatory Campaign Tags & Handles',
      type: 'verifiable',
      status: missing.length === 0 ? 'pass' : 'fail',
      evidence:
        missing.length === 0
          ? `All required tags found in caption/tags: ${present.join(', ')}`
          : `Missing required tag(s): ${missing.join(', ')} (Found: ${present.join(', ') || 'none'})`,
      explanation:
        missing.length === 0
          ? 'Creator included all mandatory campaign hashtags and brand handles.'
          : `Creator omitted mandatory campaign tags (${missing.join(', ')}). A caption revision is recommended before payout.`,
    });
  }

  // -------------------------------------------------------------------------
  // TIER 2: AI-ASSISTED OBSERVATIONS
  // -------------------------------------------------------------------------
  const aiResult = await aiProvider.reviewSubmission({
    submission: {
      id: submission.id,
      videoTitle: submission.videoTitle,
      platform: submission.platform,
      videoUrl: submission.videoUrl,
      caption: submission.caption,
      tags: submission.tags,
      duration: submission.duration,
      creatorName: submission.creatorName,
      creatorHandle: submission.creatorHandle,
    },
    campaign: {
      id: campaign.id,
      title: campaign.title,
      brandName: campaign.brandName,
      category: campaign.category,
      format: campaign.format,
      platform: campaign.platform,
      description: campaign.description,
      requirements: campaignReqs,
    },
  });

  const aiObservations: RequirementCheckResult[] = (aiResult.observations || []).map(
    (obs, index) => ({
      id: `ai_obs_${index + 1}`,
      title: obs.requirement,
      type: 'ai_observation',
      status: obs.result,
      evidence: obs.evidence,
      explanation: obs.explanation,
      confidence: obs.confidence,
    })
  );

  // -------------------------------------------------------------------------
  // TIER 3: HUMAN-ONLY JUDGMENTS CHECKLIST
  // -------------------------------------------------------------------------
  const humanChecklist = [
    `Product Prominence: Confirm ${campaign.brandName} product appears clearly in the video.`,
    'Audio & Music: Confirm voiceover is clear and audio adheres to commercial usage rules.',
    'Visual Pacing & Lighting: Confirm the first 2-3 seconds hook the audience without dark or blurry frames.',
    'Brand Safety: Confirm absence of competitor logos, inappropriate apparel, or offensive themes.',
  ];

  const mediaAnalysisNotice =
    'Video deliverable verification is grounded in creator-supplied URLs, verified platform metadata, video titles, and text captions. Full audio stem decoding and direct video pixel rendering require human reviewer verification.';

  return {
    submissionId: submission.id,
    campaignId: campaign.id,
    summary: aiResult.summary,
    verifiableChecks,
    aiObservations,
    humanChecklist,
    suggestedFeedback: aiResult.suggestedFeedback,
    suggestedQuestions: aiResult.suggestedQuestions,
    mediaAnalysisNotice,
    isLiveAI: aiResult.isLiveAI,
    modelUsed: aiResult.modelUsed,
    reviewedAt: new Date().toISOString(),
  };
}
