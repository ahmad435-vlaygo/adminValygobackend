import { Response } from 'express';
import Meeting from '../models/Meeting';
import AdminUser from '../models/AdminUser';
import { AuthRequest } from '../middleware/auth';
import emailService from '../services/emailService';

export const createMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startTime, endTime, attendees, meetingLink } = req.body;

    const meeting = new Meeting({
      title,
      description,
      startTime,
      endTime,
      attendees,
      meetingLink,
      createdBy: req.user?.id,
    });

    await meeting.save();
    await meeting.populate('attendees', 'name email');
    await meeting.populate('createdBy', 'name email');

    // Send meeting invites to attendees
    try {
      const attendeeEmails = await AdminUser.find({ _id: { $in: attendees } }).select('email name');
      for (const attendee of attendeeEmails) {
        await emailService.sendMeetingInvite(
          attendee.email,
          title,
          new Date(startTime).toLocaleString(),
          meetingLink || ''
        );
      }
    } catch (emailError) {
      console.error('Failed to send meeting invites:', emailError);
    }

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create meeting', error });
  }
};

export const getMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const meetings = await Meeting.find()
      .populate('attendees', 'name email')
      .populate('createdBy', 'name email')
      .sort({ startTime: -1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch meetings', error });
  }
};

export const updateMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, attendees, status, meetingLink } = req.body;

    const meeting = await Meeting.findByIdAndUpdate(
      id,
      { title, description, startTime, endTime, attendees, status, meetingLink },
      { new: true }
    ).populate('attendees', 'name email');

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update meeting', error });
  }
};

export const deleteMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Meeting.findByIdAndDelete(id);
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete meeting', error });
  }
};
