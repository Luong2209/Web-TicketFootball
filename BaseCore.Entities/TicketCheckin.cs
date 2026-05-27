namespace BaseCore.Entities
{
    public class TicketCheckin
    {
        public int Id { get; set; }
        public int ETicketId { get; set; }
        public string CheckinCode { get; set; } = "";
        public string Gate { get; set; } = "";
        public string DeviceId { get; set; } = "";
        public string CheckedByUserId { get; set; } = "";
        public string Status { get; set; } = "Success";
        public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
        public string Note { get; set; } = "";

        public ETicket ETicket { get; set; }
        public User CheckedByUser { get; set; }
    }
}
