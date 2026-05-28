namespace BaseCore.Entities
{
    public class ETicket
    {
        public int Id { get; set; }
        public int TicketOrderId { get; set; }
        public int TicketOrderItemId { get; set; }
        public string UserId { get; set; } = "";
        public string TicketCode { get; set; } = "";
        public string QrCodePayload { get; set; } = "";
        public string HolderName { get; set; } = "";
        public string? SeatCode { get; set; }
        public string Status { get; set; } = "Issued";
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UsedAt { get; set; }

        public TicketOrder TicketOrder { get; set; }
        public TicketOrderItem TicketOrderItem { get; set; }
        public User User { get; set; }
        public List<TicketCheckin> Checkins { get; set; } = new();
    }
}
