namespace BaseCore.Entities
{
    public class TicketOrder
    {
        public int Id { get; set; }
        public string UserId { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending";
        public string CustomerName { get; set; } = "";
        public string CustomerEmail { get; set; } = "";
        public string CustomerPhone { get; set; } = "";
        public string Note { get; set; } = "";

        public User User { get; set; }
        public List<TicketOrderItem> Items { get; set; } = new();
        public List<Payment> Payments { get; set; } = new();
        public List<ETicket> ETickets { get; set; } = new();
    }
}
