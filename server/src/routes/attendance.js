const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

// POST /api/attendance/checkin
router.post('/checkin', async (req, res) => {
    try {
        const userId = req.user.id;
        const { classId } = req.body;

        if (!classId) return res.status(400).json({ message: 'classId is required' });

        const member = await prisma.member.findUnique({
            where: { userId },
            include: { user: true }
        });
        if (!member) return res.status(404).json({ message: 'Member not found' });

        const cls = await prisma.class.findUnique({
            where: { id: parseInt(classId) },
            include: { trainer: { include: { user: true } } }
        });
        if (!cls) return res.status(404).json({ message: 'Class not found' });

        // Check if already checked in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await prisma.attendance.findFirst({
            where: {
                memberId: member.id,
                classId: parseInt(classId),
                checkinTime: { gte: today }
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'Already checked in for this class today' });
        }

        const attendance = await prisma.attendance.create({
            data: {
                memberId: member.id,
                classId: parseInt(classId),
                checkinTime: new Date(),
            },
            include: {
                member: { include: { user: true } },
                class: true
            }
        });

        // Update lastAttendance
        await prisma.member.update({
            where: { id: member.id },
            data: { lastAttendance: new Date() }
        });

        // Emit real-time event via Socket.io
        const io = req.app.get('io');
        if (io) {
            io.emit('attendance_update', {
                id: attendance.id,
                memberName: member.user.name,
                className: cls.className,
                checkinTime: attendance.checkinTime,
                memberId: member.id,
            });
        }

        res.status(201).json({ attendance, message: 'Checked in successfully!' });
    } catch (err) {
        console.error('Checkin error:', err);
        res.status(500).json({ message: 'Failed to check in' });
    }
});

// GET /api/attendance/live — recent attendance (last 50)
router.get('/live', async (req, res) => {
    try {
        const recent = await prisma.attendance.findMany({
            take: 50,
            orderBy: { checkinTime: 'desc' },
            include: {
                member: { include: { user: { select: { name: true } } } },
                class: true
            }
        });
        res.json({ attendance: recent });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch attendance' });
    }
});

module.exports = router;
