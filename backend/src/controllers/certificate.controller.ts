import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('certificate.controller');

/**
 * Get the certificate template for an event
 */
export const getCertificateTemplate = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const template = await prisma.certificateTemplate.findUnique({
      where: { eventId: event.id },
    });

    if (!template) {
      return res.status(404).json({ error: 'No template found' });
    }

    return res.json({
      ...template,
      event_id: template.eventId,
      template_url: template.templateUrl,
      sending_time: template.sendingTime,
    });
  } catch (error) {
    logger.error({ err: error, slug: req.params.slug }, 'Failed to get certificate template');
    return res.status(500).json({ error: 'Failed to fetch certificate template' });
  }
};

/**
 * Upsert certificate template for an event
 */
export const upsertCertificateTemplate = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { template_url, sending_time } = req.body;

    if (!template_url) {
      return res.status(400).json({ error: 'Template URL is required' });
    }

    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const sendingTimeVal = sending_time ? new Date(sending_time) : null;

    const template = await prisma.certificateTemplate.upsert({
      where: { eventId: event.id },
      update: {
        templateUrl: template_url,
        sendingTime: sendingTimeVal,
      },
      create: {
        eventId: event.id,
        templateUrl: template_url,
        sendingTime: sendingTimeVal,
      },
    });

    return res.json({ message: 'Certificate template saved successfully', data: template });
  } catch (error) {
    logger.error({ err: error, slug: req.params.slug }, 'Failed to save certificate template');
    return res.status(500).json({ error: 'Failed to save certificate template' });
  }
};

/**
 * Get all issued certificates for an event
 */
export const getEventCertificates = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const certificates = await prisma.certificate.findMany({
      where: { eventId: event.id },
      include: {
        recipient: { select: { name: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });

    const formatted = certificates.map((c: any) => ({
      ...c,
      event_id: c.eventId,
      issued_to: c.issuedTo,
      certificate_url: c.certificateUrl,
      issued_by: c.issuedBy,
      issued_at: c.issuedAt,
      participant_name: c.recipient?.name || null,
    }));

    return res.json(formatted);
  } catch (error) {
    logger.error({ err: error, slug: req.params.slug }, 'Failed to list event certificates');
    return res.status(500).json({ error: 'Failed to list certificates' });
  }
};

/**
 * Issue certificate to a specific participant
 */
export const issueCertificate = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { registration_id, title, description, certificate_url } = req.body;
    const issued_by = req.user?.username;

    if (!registration_id || !title) {
      return res.status(400).json({ error: 'Registration ID and Title are required' });
    }

    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const reg = await prisma.registration.findFirst({
      where: { id: BigInt(registration_id), eventId: event.id },
      select: { userId: true },
    });
    if (!reg) {
      return res.status(404).json({ error: 'Registration not found for this event' });
    }

    const cert = await prisma.certificate.create({
      data: {
        eventId: event.id,
        issuedTo: reg.userId,
        issuedBy: issued_by || null,
        certificateUrl: certificate_url || '',
      },
    });

    return res.json({ message: 'Certificate issued successfully', data: cert });
  } catch (error) {
    logger.error({ err: error, slug: req.params.slug }, 'Failed to issue certificate');
    return res.status(500).json({ error: 'Failed to issue certificate' });
  }
};

/**
 * Get all certificates issued to the current logged-in user
 */
export const getMyCertificates = async (req: Request, res: Response) => {
  try {
    const username = req.user?.username;
    if (!username) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const certificates = await prisma.certificate.findMany({
      where: { issuedTo: username },
      include: {
        event: {
          select: { title: true, slug: true, date: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    const formatted = certificates.map((c: any) => ({
      ...c,
      event_id: c.eventId,
      issued_to: c.issuedTo,
      certificate_url: c.certificateUrl,
      issued_by: c.issuedBy,
      issued_at: c.issuedAt,
      event_title: c.event.title,
      event_slug: c.event.slug,
      event_date: c.event.date,
    }));

    return res.json(formatted);
  } catch (error) {
    logger.error({ err: error, username: req.user?.username }, 'Failed to get user certificates');
    return res.status(500).json({ error: 'Failed to fetch certificates' });
  }
};
